// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EIP7702AuthorizedCode
 * @dev This contract serves as the authorized code for EIP-7702 account delegation
 * It can be installed into EOAs to enable delegation functionality
 */
contract EIP7702AuthorizedCode {
    // Storage slot for delegation manager address
    bytes32 private constant DELEGATION_MANAGER_SLOT =
        keccak256("eip7702.delegation.manager");

    // Storage slot for owner address (original EOA owner)
    bytes32 private constant OWNER_SLOT = keccak256("eip7702.delegation.owner");

    event DelegationManagerSet(address indexed manager);
    event OwnerSet(address indexed owner);

    modifier onlyOwner() {
        require(msg.sender == getOwner(), "Not authorized");
        _;
    }

    /**
     * @dev Initialize the authorized code with delegation manager and owner
     * @param delegationManager Address of the delegation manager contract
     * @param owner Original EOA owner address
     */
    function initialize(address delegationManager, address owner) external {
        require(getDelegationManager() == address(0), "Already initialized");
        require(delegationManager != address(0), "Invalid delegation manager");
        require(owner != address(0), "Invalid owner");

        _setDelegationManager(delegationManager);
        _setOwner(owner);
    }

    /**
     * @dev Execute a delegated transaction
     * @param target Target contract address
     * @param data Transaction data
     * @param value ETH value to send
     */
    function executeDelegatedCall(
        address target,
        bytes calldata data,
        uint256 value
    ) external onlyOwner returns (bool success, bytes memory returnData) {
        require(target != address(0), "Invalid target");

        // Execute the call
        (success, returnData) = target.call{value: value}(data);

        return (success, returnData);
    }

    /**
     * @dev Batch execute multiple delegated transactions
     * @param targets Array of target contract addresses
     * @param datas Array of transaction data
     * @param values Array of ETH values to send
     */
    function batchExecuteDelegatedCalls(
        address[] calldata targets,
        bytes[] calldata datas,
        uint256[] calldata values
    )
        external
        onlyOwner
        returns (bool[] memory successes, bytes[] memory returnDatas)
    {
        require(
            targets.length == datas.length && datas.length == values.length,
            "Array length mismatch"
        );

        successes = new bool[](targets.length);
        returnDatas = new bytes[](targets.length);

        for (uint256 i = 0; i < targets.length; i++) {
            (successes[i], returnDatas[i]) = targets[i].call{value: values[i]}(
                datas[i]
            );
        }

        return (successes, returnDatas);
    }

    /**
     * @dev Transfer ETH from this account
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferETH(
        address payable to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Transfer ERC20 tokens from this account
     * @param token Token contract address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(to != address(0), "Invalid recipient");

        // Call transfer function on token contract
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );

        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "Transfer failed"
        );
    }

    /**
     * @dev Approve ERC20 token spending
     * @param token Token contract address
     * @param spender Spender address
     * @param amount Amount to approve
     */
    function approveERC20(
        address token,
        address spender,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(spender != address(0), "Invalid spender");

        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("approve(address,uint256)", spender, amount)
        );

        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "Approval failed"
        );
    }

    /**
     * @dev Create a subscription via the delegation manager
     * @param delegationManager Address of the delegation manager
     * @param recipient Address to receive recurring payments
     * @param token Token contract address (address(0) for ETH)
     * @param amountPerInterval Amount to transfer each interval
     * @param totalAmount Total amount to deposit
     * @param startTime When the subscription should start
     * @param interval Payment interval in seconds
     * @param periods Total number of payment periods
     */
    function createSubscription(
        address delegationManager,
        address recipient,
        address token,
        uint256 amountPerInterval,
        uint256 totalAmount,
        uint256 startTime,
        uint256 interval,
        uint256 periods
    ) external onlyOwner {
        require(delegationManager != address(0), "Invalid delegation manager");
        require(recipient != address(0), "Invalid recipient");
        require(
            totalAmount == amountPerInterval * periods,
            "Total amount mismatch"
        );

        if (token == address(0)) {
            // ETH subscription
            require(
                address(this).balance >= totalAmount,
                "Insufficient ETH balance"
            );

            (bool success, ) = delegationManager.call{value: totalAmount}(
                abi.encodeWithSignature(
                    "createSubscription(address,address,uint256,uint256,uint256,uint256,uint256)",
                    recipient,
                    token,
                    amountPerInterval,
                    totalAmount,
                    startTime,
                    interval,
                    periods
                )
            );
            require(success, "Subscription creation failed");
        } else {
            // ERC20 subscription - first approve, then create
            (bool approveSuccess, bytes memory approveData) = token.call(
                abi.encodeWithSignature(
                    "approve(address,uint256)",
                    delegationManager,
                    totalAmount
                )
            );
            require(
                approveSuccess &&
                    (approveData.length == 0 ||
                        abi.decode(approveData, (bool))),
                "Token approval failed"
            );

            (bool success, ) = delegationManager.call(
                abi.encodeWithSignature(
                    "createSubscription(address,address,uint256,uint256,uint256,uint256,uint256)",
                    recipient,
                    token,
                    amountPerInterval,
                    totalAmount,
                    startTime,
                    interval,
                    periods
                )
            );
            require(success, "Subscription creation failed");
        }
    }

    /**
     * @dev Cancel a subscription via the delegation manager
     * @param delegationManager Address of the delegation manager
     * @param subscriptionId ID of the subscription to cancel
     */
    function cancelSubscription(
        address delegationManager,
        uint256 subscriptionId
    ) external onlyOwner {
        require(delegationManager != address(0), "Invalid delegation manager");

        (bool success, ) = delegationManager.call(
            abi.encodeWithSignature(
                "cancelSubscription(uint256)",
                subscriptionId
            )
        );
        require(success, "Subscription cancellation failed");
    }

    /**
     * @dev Pause a subscription via the delegation manager
     * @param delegationManager Address of the delegation manager
     * @param subscriptionId ID of the subscription to pause
     */
    function pauseSubscription(
        address delegationManager,
        uint256 subscriptionId
    ) external onlyOwner {
        require(delegationManager != address(0), "Invalid delegation manager");

        (bool success, ) = delegationManager.call(
            abi.encodeWithSignature(
                "pauseSubscription(uint256)",
                subscriptionId
            )
        );
        require(success, "Subscription pause failed");
    }

    /**
     * @dev Resume a subscription via the delegation manager
     * @param delegationManager Address of the delegation manager
     * @param subscriptionId ID of the subscription to resume
     */
    function resumeSubscription(
        address delegationManager,
        uint256 subscriptionId
    ) external onlyOwner {
        require(delegationManager != address(0), "Invalid delegation manager");

        (bool success, ) = delegationManager.call(
            abi.encodeWithSignature(
                "resumeSubscription(uint256)",
                subscriptionId
            )
        );
        require(success, "Subscription resume failed");
    }

    /**
     * @dev Process a subscription payment via the delegation manager
     * @param delegationManager Address of the delegation manager
     * @param subscriptionId ID of the subscription to process
     */
    function processSubscriptionPayment(
        address delegationManager,
        uint256 subscriptionId
    ) external onlyOwner {
        require(delegationManager != address(0), "Invalid delegation manager");

        (bool success, ) = delegationManager.call(
            abi.encodeWithSignature(
                "processSubscriptionPayment(uint256)",
                subscriptionId
            )
        );
        require(success, "Subscription payment processing failed");
    }

    /**
     * @dev Get the delegation manager address
     */
    function getDelegationManager() public view returns (address) {
        bytes32 slot = DELEGATION_MANAGER_SLOT;
        address manager;
        assembly {
            manager := sload(slot)
        }
        return manager;
    }

    /**
     * @dev Get the owner address
     */
    function getOwner() public view returns (address) {
        bytes32 slot = OWNER_SLOT;
        address owner;
        assembly {
            owner := sload(slot)
        }
        return owner;
    }

    /**
     * @dev Set the delegation manager address (internal)
     */
    function _setDelegationManager(address manager) internal {
        bytes32 slot = DELEGATION_MANAGER_SLOT;
        assembly {
            sstore(slot, manager)
        }
        emit DelegationManagerSet(manager);
    }

    /**
     * @dev Set the owner address (internal)
     */
    function _setOwner(address owner) internal {
        bytes32 slot = OWNER_SLOT;
        assembly {
            sstore(slot, owner)
        }
        emit OwnerSet(owner);
    }

    /**
     * @dev Fallback function to handle direct calls
     */
    fallback() external payable {
        // For EIP-7702, this can be used to handle generic calls
        // Implementation depends on specific use case
    }

    /**
     * @dev Receive function to handle plain ETH transfers
     */
    receive() external payable {
        // Allow receiving ETH
    }

    /**
     * @dev Batch process multiple subscription payments
     * @param delegationManager Address of the delegation manager
     * @param subscriptionIds Array of subscription IDs to process
     */
    function batchProcessSubscriptionPayments(
        address delegationManager,
        uint256[] calldata subscriptionIds
    ) external onlyOwner {
        require(delegationManager != address(0), "Invalid delegation manager");

        (bool success, ) = delegationManager.call(
            abi.encodeWithSignature(
                "batchProcessSubscriptionPayments(uint256[])",
                subscriptionIds
            )
        );
        require(success, "Batch subscription processing failed");
    }

    /**
     * @dev Check if this contract supports an interface
     * @param interfaceId Interface identifier
     */
    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        // EIP-7702 interface support can be added here
        return interfaceId == 0x01ffc9a7; // ERC165
    }
}
