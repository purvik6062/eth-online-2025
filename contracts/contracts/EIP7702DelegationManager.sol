// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EIP7702DelegationManager
 * @dev Implements EIP-7702 delegation functionality with time-based asset delegation
 * Users can delegate their assets for specific time periods with automatic expiration
 */
contract EIP7702DelegationManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Delegation {
        address delegator; // Original asset owner
        address delegate; // Address receiving delegation
        address asset; // Asset contract address (address(0) for ETH)
        uint256 amount; // Amount delegated
        uint256 startTime; // When delegation starts
        uint256 endTime; // When delegation expires
        bool isActive; // Whether delegation is active
        bool isRevoked; // Whether delegation was manually revoked
    }

    struct DelegationAuthority {
        address authorizedCode; // EIP-7702 authorized code address
        uint256 nonce; // Nonce for replay protection
        bool isActive; // Whether authority is active
    }

    struct Subscription {
        address subscriber; // User who created the subscription
        address recipient; // Address receiving the recurring payments
        address token; // Token contract address (address(0) for ETH)
        uint256 amountPerInterval; // Amount to transfer each interval
        uint256 totalAmount; // Total amount deposited
        uint256 remainingAmount; // Amount remaining for future payments
        uint256 startTime; // When subscription starts
        uint256 interval; // Payment interval in seconds (e.g., 30 days for monthly)
        uint256 periods; // Total number of payment periods
        uint256 periodsRemaining; // Number of periods remaining
        uint256 nextPaymentTime; // Timestamp of next payment
        bool isActive; // Whether subscription is active
        bool isPaused; // Whether subscription is paused by subscriber
    }

    // Mapping from delegation ID to delegation details
    mapping(uint256 => Delegation) public delegations;

    // Mapping from user address to their delegation authority
    mapping(address => DelegationAuthority) public delegationAuthorities;

    // Mapping from delegator to list of their delegation IDs
    mapping(address => uint256[]) public userDelegations;

    // Mapping from delegate to list of delegation IDs they received
    mapping(address => uint256[]) public receivedDelegations;

    // Subscription mappings
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256[]) public userSubscriptions;
    mapping(address => uint256[]) public receivedSubscriptions;

    uint256 public nextDelegationId = 1;
    uint256 public nextSubscriptionId = 1;
    uint256 public maxDelegationDuration = 365 days; // 1 year max
    uint256 public minDelegationDuration = 1 hours; // 1 hour min
    uint256 public maxSubscriptionDuration = 365 days; // 1 year max
    uint256 public minSubscriptionInterval = 1 days; // 1 day min interval

    // Events
    event DelegationCreated(
        uint256 indexed delegationId,
        address indexed delegator,
        address indexed delegate,
        address asset,
        uint256 amount,
        uint256 startTime,
        uint256 endTime
    );

    event DelegationRevoked(
        uint256 indexed delegationId,
        address indexed delegator,
        address indexed delegate
    );

    event DelegationExpired(
        uint256 indexed delegationId,
        address indexed delegator,
        address indexed delegate
    );

    event DelegatedETHWithdrawn(
        uint256 indexed delegationId,
        address indexed delegator,
        address indexed delegate,
        uint256 amount
    );

    event DelegatedTokensTransferred(
        uint256 indexed delegationId,
        address indexed delegator,
        address indexed delegate,
        address to,
        uint256 amount
    );

    event AuthorityGranted(
        address indexed user,
        address indexed authorizedCode,
        uint256 nonce
    );

    event AuthorityRevoked(
        address indexed user,
        address indexed authorizedCode
    );

    // Subscription events
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed recipient,
        address token,
        uint256 amountPerInterval,
        uint256 totalAmount,
        uint256 startTime,
        uint256 interval,
        uint256 periods
    );

    event SubscriptionPaymentProcessed(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 periodNumber
    );

    event SubscriptionCancelled(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed recipient,
        uint256 remainingAmount
    );

    event SubscriptionPaused(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );

    event SubscriptionResumed(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );

    event SubscriptionCompleted(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed recipient
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Grant delegation authority using EIP-7702
     * @param authorizedCode The code address to authorize for delegations
     */
    function grantDelegationAuthority(address authorizedCode) external {
        require(authorizedCode != address(0), "Invalid authorized code");

        delegationAuthorities[msg.sender] = DelegationAuthority({
            authorizedCode: authorizedCode,
            nonce: delegationAuthorities[msg.sender].nonce + 1,
            isActive: true
        });

        emit AuthorityGranted(
            msg.sender,
            authorizedCode,
            delegationAuthorities[msg.sender].nonce
        );
    }

    /**
     * @dev Revoke delegation authority
     */
    function revokeDelegationAuthority() external {
        require(
            delegationAuthorities[msg.sender].isActive,
            "No active authority"
        );

        address authorizedCode = delegationAuthorities[msg.sender]
            .authorizedCode;
        delegationAuthorities[msg.sender].isActive = false;

        emit AuthorityRevoked(msg.sender, authorizedCode);
    }

    /**
     * @dev Create a new time-based delegation
     * @param delegate Address to delegate assets to
     * @param asset Asset contract address (address(0) for ETH)
     * @param amount Amount to delegate
     * @param duration Duration of delegation in seconds
     */
    function createDelegation(
        address delegate,
        address asset,
        uint256 amount,
        uint256 duration
    ) external payable nonReentrant {
        require(delegate != address(0), "Invalid delegate");
        require(delegate != msg.sender, "Cannot delegate to self");
        require(amount > 0, "Amount must be greater than 0");
        require(duration >= minDelegationDuration, "Duration too short");
        require(duration <= maxDelegationDuration, "Duration too long");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        // Handle ETH delegation
        if (asset == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            // Handle ERC20 delegation
            require(msg.value == 0, "No ETH should be sent for ERC20");
            IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        }

        uint256 delegationId = nextDelegationId++;

        delegations[delegationId] = Delegation({
            delegator: msg.sender,
            delegate: delegate,
            asset: asset,
            amount: amount,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            isRevoked: false
        });

        userDelegations[msg.sender].push(delegationId);
        receivedDelegations[delegate].push(delegationId);

        emit DelegationCreated(
            delegationId,
            msg.sender,
            delegate,
            asset,
            amount,
            startTime,
            endTime
        );
    }

    /**
     * @dev Manually revoke an active delegation before expiration
     * @param delegationId ID of the delegation to revoke
     */
    function revokeDelegation(uint256 delegationId) external nonReentrant {
        Delegation storage delegation = delegations[delegationId];

        require(delegation.delegator == msg.sender, "Not the delegator");
        require(delegation.isActive, "Delegation not active");
        require(!delegation.isRevoked, "Already revoked");
        require(block.timestamp < delegation.endTime, "Already expired");

        delegation.isActive = false;
        delegation.isRevoked = true;

        // Return assets to delegator
        _returnAssets(delegation);

        emit DelegationRevoked(
            delegationId,
            delegation.delegator,
            delegation.delegate
        );
    }

    /**
     * @dev Process expired delegations and return assets
     * @param delegationId ID of the delegation to process
     */
    function processExpiredDelegation(
        uint256 delegationId
    ) external nonReentrant {
        Delegation storage delegation = delegations[delegationId];

        require(delegation.isActive, "Delegation not active");
        require(block.timestamp >= delegation.endTime, "Not yet expired");

        delegation.isActive = false;

        // Return assets to delegator
        _returnAssets(delegation);

        emit DelegationExpired(
            delegationId,
            delegation.delegator,
            delegation.delegate
        );
    }

    /**
     * @dev Allow delegate to withdraw delegated ETH during active delegation
     * @param delegationId ID of the delegation to withdraw from
     * @param amount Amount of ETH to withdraw
     */
    function withdrawDelegatedETH(
        uint256 delegationId,
        uint256 amount
    ) external nonReentrant {
        Delegation storage delegation = delegations[delegationId];

        require(delegation.delegate == msg.sender, "Not the delegate");
        require(delegation.isActive, "Delegation not active");
        require(!delegation.isRevoked, "Delegation revoked");
        require(block.timestamp < delegation.endTime, "Delegation expired");
        require(delegation.asset == address(0), "Not ETH delegation");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= delegation.amount, "Insufficient delegated amount");

        // Reduce the delegated amount
        delegation.amount -= amount;

        // If all amount is withdrawn, mark as inactive
        if (delegation.amount == 0) {
            delegation.isActive = false;
        }

        // Transfer ETH to delegate
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit DelegatedETHWithdrawn(
            delegationId,
            delegation.delegator,
            msg.sender,
            amount
        );
    }

    /**
     * @dev Allow delegate to transfer delegated ERC20 tokens
     * @param delegationId ID of the delegation
     * @param to Address to transfer tokens to
     * @param amount Amount of tokens to transfer
     */
    function transferDelegatedTokens(
        uint256 delegationId,
        address to,
        uint256 amount
    ) external nonReentrant {
        Delegation storage delegation = delegations[delegationId];

        require(delegation.delegate == msg.sender, "Not the delegate");
        require(delegation.isActive, "Delegation not active");
        require(!delegation.isRevoked, "Delegation revoked");
        require(block.timestamp < delegation.endTime, "Delegation expired");
        require(delegation.asset != address(0), "Not token delegation");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= delegation.amount, "Insufficient delegated amount");

        // Reduce the delegated amount
        delegation.amount -= amount;

        // If all amount is transferred, mark as inactive
        if (delegation.amount == 0) {
            delegation.isActive = false;
        }

        // Transfer tokens to specified address
        IERC20(delegation.asset).safeTransfer(to, amount);

        emit DelegatedTokensTransferred(
            delegationId,
            delegation.delegator,
            msg.sender,
            to,
            amount
        );
    }

    /**
     * @dev Get available amount for delegate to use
     * @param delegationId ID of the delegation
     * @return availableAmount Amount available for delegate to use
     */
    function getAvailableDelegatedAmount(
        uint256 delegationId
    ) external view returns (uint256) {
        Delegation memory delegation = delegations[delegationId];

        if (
            !delegation.isActive ||
            delegation.isRevoked ||
            block.timestamp >= delegation.endTime
        ) {
            return 0;
        }

        return delegation.amount;
    }

    /**
     * @dev Internal function to return assets to delegator
     * @param delegation The delegation struct containing asset details
     */
    function _returnAssets(Delegation memory delegation) internal {
        if (delegation.asset == address(0)) {
            // Return ETH
            (bool success, ) = delegation.delegator.call{
                value: delegation.amount
            }("");
            require(success, "ETH transfer failed");
        } else {
            // Return ERC20 tokens
            IERC20(delegation.asset).safeTransfer(
                delegation.delegator,
                delegation.amount
            );
        }
    }

    /**
     * @dev Check if a delegation is currently active
     * @param delegationId ID of the delegation to check
     * @return isActive Whether the delegation is active
     * @return timeLeft Seconds remaining until expiration (0 if expired)
     */
    function getDelegationStatus(
        uint256 delegationId
    ) external view returns (bool isActive, uint256 timeLeft) {
        Delegation memory delegation = delegations[delegationId];

        if (!delegation.isActive || delegation.isRevoked) {
            return (false, 0);
        }

        if (block.timestamp >= delegation.endTime) {
            return (false, 0);
        }

        return (true, delegation.endTime - block.timestamp);
    }

    /**
     * @dev Get user's delegation IDs
     * @param user Address of the user
     * @return delegationIds Array of delegation IDs created by the user
     */
    function getUserDelegations(
        address user
    ) external view returns (uint256[] memory) {
        return userDelegations[user];
    }

    /**
     * @dev Get delegation IDs received by a delegate
     * @param delegate Address of the delegate
     * @return delegationIds Array of delegation IDs received by the delegate
     */
    function getReceivedDelegations(
        address delegate
    ) external view returns (uint256[] memory) {
        return receivedDelegations[delegate];
    }

    /**
     * @dev Get delegation details
     * @param delegationId ID of the delegation
     * @return delegation The delegation struct
     */
    function getDelegation(
        uint256 delegationId
    ) external view returns (Delegation memory) {
        return delegations[delegationId];
    }

    /**
     * @dev Update delegation duration limits (only owner)
     * @param newMinDuration New minimum delegation duration
     * @param newMaxDuration New maximum delegation duration
     */
    function updateDurationLimits(
        uint256 newMinDuration,
        uint256 newMaxDuration
    ) external onlyOwner {
        require(newMinDuration > 0, "Min duration must be positive");
        require(
            newMaxDuration > newMinDuration,
            "Max must be greater than min"
        );

        minDelegationDuration = newMinDuration;
        maxDelegationDuration = newMaxDuration;
    }

    /**
     * @dev Create a new subscription with recurring payments
     * @param recipient Address to receive recurring payments
     * @param token Token contract address (address(0) for ETH)
     * @param amountPerInterval Amount to transfer each interval
     * @param totalAmount Total amount to deposit (must equal amountPerInterval * periods)
     * @param startTime When the subscription should start
     * @param interval Payment interval in seconds (e.g., 30 days)
     * @param periods Total number of payment periods
     */
    function createSubscription(
        address recipient,
        address token,
        uint256 amountPerInterval,
        uint256 totalAmount,
        uint256 startTime,
        uint256 interval,
        uint256 periods
    ) external payable nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot subscribe to self");
        require(amountPerInterval > 0, "Amount must be greater than zero");
        require(
            totalAmount == amountPerInterval * periods,
            "Total amount mismatch"
        );
        require(interval >= minSubscriptionInterval, "Interval too short");
        require(
            interval * periods <= maxSubscriptionDuration,
            "Total duration too long"
        );
        require(periods > 0, "Periods must be greater than zero");
        require(startTime >= block.timestamp, "Start time must be in future");

        // Handle payment collection
        if (token == address(0)) {
            // ETH subscription
            require(msg.value == totalAmount, "ETH amount mismatch");
        } else {
            // ERC20 subscription
            require(
                msg.value == 0,
                "No ETH should be sent for token subscription"
            );
            IERC20(token).safeTransferFrom(
                msg.sender,
                address(this),
                totalAmount
            );
        }

        uint256 subscriptionId = nextSubscriptionId++;

        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            recipient: recipient,
            token: token,
            amountPerInterval: amountPerInterval,
            totalAmount: totalAmount,
            remainingAmount: totalAmount,
            startTime: startTime,
            interval: interval,
            periods: periods,
            periodsRemaining: periods,
            nextPaymentTime: startTime,
            isActive: true,
            isPaused: false
        });

        userSubscriptions[msg.sender].push(subscriptionId);
        receivedSubscriptions[recipient].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            msg.sender,
            recipient,
            token,
            amountPerInterval,
            totalAmount,
            startTime,
            interval,
            periods
        );
    }

    /**
     * @dev Process a subscription payment (can be called by anyone)
     * @param subscriptionId ID of the subscription to process
     */
    function processSubscriptionPayment(
        uint256 subscriptionId
    ) external nonReentrant {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.isActive, "Subscription is not active");
        require(!sub.isPaused, "Subscription is paused");
        require(
            block.timestamp >= sub.nextPaymentTime,
            "Not yet time for next payment"
        );
        require(sub.periodsRemaining > 0, "No remaining periods");
        require(
            sub.remainingAmount >= sub.amountPerInterval,
            "Insufficient remaining amount"
        );

        // Calculate current period number
        uint256 currentPeriod = sub.periods - sub.periodsRemaining + 1;

        // Process payment
        if (sub.token == address(0)) {
            // ETH payment
            (bool success, ) = sub.recipient.call{value: sub.amountPerInterval}(
                ""
            );
            require(success, "ETH transfer failed");
        } else {
            // ERC20 payment
            IERC20(sub.token).safeTransfer(
                sub.recipient,
                sub.amountPerInterval
            );
        }

        // Update subscription state
        sub.remainingAmount -= sub.amountPerInterval;
        sub.periodsRemaining--;
        sub.nextPaymentTime += sub.interval;

        emit SubscriptionPaymentProcessed(
            subscriptionId,
            sub.subscriber,
            sub.recipient,
            sub.token,
            sub.amountPerInterval,
            currentPeriod
        );

        // Check if subscription is complete
        if (sub.periodsRemaining == 0) {
            sub.isActive = false;
            emit SubscriptionCompleted(
                subscriptionId,
                sub.subscriber,
                sub.recipient
            );
        }
    }

    /**
     * @dev Cancel a subscription and return remaining funds
     * @param subscriptionId ID of the subscription to cancel
     */
    function cancelSubscription(uint256 subscriptionId) external nonReentrant {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Only subscriber can cancel");
        require(sub.isActive, "Subscription is not active");
        require(sub.remainingAmount > 0, "No remaining amount to refund");

        uint256 refundAmount = sub.remainingAmount;
        sub.remainingAmount = 0;
        sub.isActive = false;

        // Return remaining funds to subscriber
        if (sub.token == address(0)) {
            // ETH refund
            (bool success, ) = sub.subscriber.call{value: refundAmount}("");
            require(success, "ETH refund failed");
        } else {
            // ERC20 refund
            IERC20(sub.token).safeTransfer(sub.subscriber, refundAmount);
        }

        emit SubscriptionCancelled(
            subscriptionId,
            sub.subscriber,
            sub.recipient,
            refundAmount
        );
    }

    /**
     * @dev Pause a subscription
     * @param subscriptionId ID of the subscription to pause
     */
    function pauseSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Only subscriber can pause");
        require(sub.isActive, "Subscription is not active");
        require(!sub.isPaused, "Subscription is already paused");

        sub.isPaused = true;
        emit SubscriptionPaused(subscriptionId, msg.sender);
    }

    /**
     * @dev Resume a paused subscription
     * @param subscriptionId ID of the subscription to resume
     */
    function resumeSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Only subscriber can resume");
        require(sub.isActive, "Subscription is not active");
        require(sub.isPaused, "Subscription is not paused");

        // Adjust next payment time based on pause duration
        uint256 pauseDuration = block.timestamp -
            (sub.nextPaymentTime - sub.interval);
        sub.nextPaymentTime =
            block.timestamp +
            sub.interval -
            (pauseDuration % sub.interval);
        sub.isPaused = false;

        emit SubscriptionResumed(subscriptionId, msg.sender);
    }

    /**
     * @dev Emergency function to process multiple expired delegations
     * @param delegationIds Array of delegation IDs to process
     */
    function batchProcessExpired(uint256[] calldata delegationIds) external {
        for (uint256 i = 0; i < delegationIds.length; i++) {
            Delegation storage delegation = delegations[delegationIds[i]];

            if (
                delegation.isActive &&
                block.timestamp >= delegation.endTime &&
                !delegation.isRevoked
            ) {
                delegation.isActive = false;
                _returnAssets(delegation);

                emit DelegationExpired(
                    delegationIds[i],
                    delegation.delegator,
                    delegation.delegate
                );
            }
        }
    }

    /**
     * @dev Process multiple subscription payments in batch
     * @param subscriptionIds Array of subscription IDs to process
     */
    function batchProcessSubscriptionPayments(
        uint256[] calldata subscriptionIds
    ) external {
        for (uint256 i = 0; i < subscriptionIds.length; i++) {
            Subscription storage sub = subscriptions[subscriptionIds[i]];

            if (
                sub.isActive &&
                !sub.isPaused &&
                block.timestamp >= sub.nextPaymentTime &&
                sub.periodsRemaining > 0 &&
                sub.remainingAmount >= sub.amountPerInterval
            ) {
                uint256 currentPeriod = sub.periods - sub.periodsRemaining + 1;

                // Process payment
                if (sub.token == address(0)) {
                    (bool success, ) = sub.recipient.call{
                        value: sub.amountPerInterval
                    }("");
                    if (success) {
                        sub.remainingAmount -= sub.amountPerInterval;
                        sub.periodsRemaining--;
                        sub.nextPaymentTime += sub.interval;

                        emit SubscriptionPaymentProcessed(
                            subscriptionIds[i],
                            sub.subscriber,
                            sub.recipient,
                            sub.token,
                            sub.amountPerInterval,
                            currentPeriod
                        );

                        if (sub.periodsRemaining == 0) {
                            sub.isActive = false;
                            emit SubscriptionCompleted(
                                subscriptionIds[i],
                                sub.subscriber,
                                sub.recipient
                            );
                        }
                    }
                } else {
                    try
                        IERC20(sub.token).transfer(
                            sub.recipient,
                            sub.amountPerInterval
                        )
                    returns (bool success) {
                        if (success) {
                            sub.remainingAmount -= sub.amountPerInterval;
                            sub.periodsRemaining--;
                            sub.nextPaymentTime += sub.interval;

                            emit SubscriptionPaymentProcessed(
                                subscriptionIds[i],
                                sub.subscriber,
                                sub.recipient,
                                sub.token,
                                sub.amountPerInterval,
                                currentPeriod
                            );

                            if (sub.periodsRemaining == 0) {
                                sub.isActive = false;
                                emit SubscriptionCompleted(
                                    subscriptionIds[i],
                                    sub.subscriber,
                                    sub.recipient
                                );
                            }
                        }
                    } catch {
                        // Continue to next subscription if transfer fails
                        continue;
                    }
                }
            }
        }
    }

    /**
     * @dev Get subscription details
     * @param subscriptionId ID of the subscription
     * @return subscription The subscription struct
     */
    function getSubscription(
        uint256 subscriptionId
    ) external view returns (Subscription memory) {
        return subscriptions[subscriptionId];
    }

    /**
     * @dev Get user's subscription IDs
     * @param user Address of the user
     * @return subscriptionIds Array of subscription IDs created by the user
     */
    function getUserSubscriptions(
        address user
    ) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    /**
     * @dev Get subscription IDs received by a recipient
     * @param recipient Address of the recipient
     * @return subscriptionIds Array of subscription IDs received by the recipient
     */
    function getReceivedSubscriptions(
        address recipient
    ) external view returns (uint256[] memory) {
        return receivedSubscriptions[recipient];
    }

    /**
     * @dev Check if a subscription payment is due
     * @param subscriptionId ID of the subscription
     * @return isDue Whether payment is due
     * @return timeUntilDue Seconds until next payment (0 if due now)
     */
    function getSubscriptionPaymentStatus(
        uint256 subscriptionId
    ) external view returns (bool isDue, uint256 timeUntilDue) {
        Subscription memory sub = subscriptions[subscriptionId];

        if (!sub.isActive || sub.isPaused || sub.periodsRemaining == 0) {
            return (false, 0);
        }

        if (block.timestamp >= sub.nextPaymentTime) {
            return (true, 0);
        }

        return (false, sub.nextPaymentTime - block.timestamp);
    }

    /**
     * @dev Update subscription duration limits (only owner)
     * @param newMinInterval New minimum subscription interval
     * @param newMaxDuration New maximum subscription duration
     */
    function updateSubscriptionLimits(
        uint256 newMinInterval,
        uint256 newMaxDuration
    ) external onlyOwner {
        require(newMinInterval > 0, "Min interval must be positive");
        require(
            newMaxDuration > newMinInterval,
            "Max duration must be greater than min interval"
        );

        minSubscriptionInterval = newMinInterval;
        maxSubscriptionDuration = newMaxDuration;
    }

    // Allow contract to receive ETH
    receive() external payable {}

    /**
     * @dev Get subscription remaining balance
     * @param subscriptionId ID of the subscription
     * @return remainingAmount Amount remaining in the subscription
     */
    function getSubscriptionRemainingBalance(
        uint256 subscriptionId
    ) external view returns (uint256) {
        return subscriptions[subscriptionId].remainingAmount;
    }

    /**
     * @dev Get next payment time for a subscription
     * @param subscriptionId ID of the subscription
     * @return nextPaymentTime Timestamp of next payment
     */
    function getSubscriptionNextPayment(
        uint256 subscriptionId
    ) external view returns (uint256) {
        return subscriptions[subscriptionId].nextPaymentTime;
    }
}
