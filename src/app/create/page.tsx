'use client';

import { useState } from 'react';
import { Upload, Calendar, DollarSign, Users, Target, FileText, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/card-new';
import Button from '@/components/ui/button-new';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
}

interface TeamMember {
  id: string;
  name: string;
  wallet: string;
  percentage: number;
}

export default function CreateCampaign() {
  const { address } = useAccount();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: '',
    chain: 'ethereum',
    image: null as File | null,
    documents: [] as File[],
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: '', description: '', amount: 0, deadline: '' }
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: '', wallet: '', percentage: 0 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const chains = [
    { value: 'ethereum', label: 'Ethereum', symbol: 'ETH' },
    { value: 'polygon', label: 'Polygon', symbol: 'MATIC' },
    { value: 'arbitrum', label: 'Arbitrum', symbol: 'ARB' },
    { value: 'optimism', label: 'Optimism', symbol: 'OP' },
    { value: 'base', label: 'Base', symbol: 'ETH' },
  ];

  const handleInputChange = (field: string, value: string | File | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMilestoneChange = (id: string, field: string, value: string | number) => {
    setMilestones(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addMilestone = () => {
    setMilestones(prev => [...prev, {
      id: Date.now().toString(),
      title: '',
      description: '',
      amount: 0,
      deadline: ''
    }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleTeamMemberChange = (id: string, field: string, value: string | number) => {
    setTeamMembers(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      wallet: '',
      percentage: 0
    }]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleFileUpload = (type: 'image' | 'documents', file: File) => {
    if (type === 'image') {
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setFormData(prev => ({ ...prev, documents: [...prev.documents, file] }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      goal: '',
      deadline: '',
      chain: 'ethereum',
      image: null,
      documents: [],
    });
    setMilestones([{ id: '1', title: '', description: '', amount: 0, deadline: '' }]);
    setTeamMembers([{ id: '1', name: '', wallet: '', percentage: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        goal: Number(formData.goal),
        deadline: formData.deadline,
        chain: formData.chain,
        image: formData.image?.name || '',
        documents: formData.documents.map(doc => doc.name),
        milestones: milestones.filter(m => m.title && m.description),
        teamMembers: teamMembers.filter(m => m.name && m.wallet),
        userAddress: address
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        resetForm();
      } else {
        toast.error('Creation Failed', result.error);
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast.error('Creation Failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Create Your Campaign
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-6">
              Launch your project with transparent, automated funding across multiple blockchains
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Campaign Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full input-neobrutal"
                    placeholder="Enter your campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full input-neobrutal resize-none"
                    placeholder="Describe your project, goals, and how funds will be used"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Funding Goal (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className="w-full input-neobrutal"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className="w-full input-neobrutal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Target Chain *
                  </label>
                  <select
                    value={formData.chain}
                    onChange={(e) => handleInputChange('chain', e.target.value)}
                    className="w-full input-neobrutal"
                  >
                    {chains.map(chain => (
                      <option key={chain.value} value={chain.value}>
                        {chain.label} ({chain.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Milestones */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Milestones
                </h2>
                <Button type="button" variant="outline" onClick={addMilestone} className="cursor-pointer">
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border-2 border-foreground/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Milestone {index + 1}</h3>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(milestone.id)}
                          className="cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(milestone.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 input-neobrutal text-sm"
                          placeholder="Milestone title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Amount (USD)
                        </label>
                        <input
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => handleMilestoneChange(milestone.id, 'amount', Number(e.target.value))}
                          className="w-full px-3 py-2 input-neobrutal text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(milestone.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 input-neobrutal text-sm resize-none"
                        placeholder="Describe what will be delivered"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={milestone.deadline}
                        onChange={(e) => handleMilestoneChange(milestone.id, 'deadline', e.target.value)}
                        className="w-full px-3 py-2 input-neobrutal text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Team Members */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Team & Fund Distribution
                </h2>
                <Button type="button" variant="outline" onClick={addTeamMember} className="cursor-pointer">
                  Add Member
                </Button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="border-2 border-foreground/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Team Member {index + 1}</h3>
                      {teamMembers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          className="cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(member.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 input-neobrutal text-sm"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Wallet Address
                        </label>
                        <input
                          type="text"
                          value={member.wallet}
                          onChange={(e) => handleTeamMemberChange(member.id, 'wallet', e.target.value)}
                          className="w-full px-3 py-2 input-neobrutal text-sm"
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Percentage
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={member.percentage}
                          onChange={(e) => handleTeamMemberChange(member.id, 'percentage', Number(e.target.value))}
                          className="w-full px-3 py-2 input-neobrutal text-sm"
                          placeholder="25"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* File Uploads */}
            <Card>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-3" />
                Media & Documentation
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Campaign Image *
                  </label>
                  <div className="border-2 border-dashed border-foreground/30 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                    <p className="text-foreground/70 mb-2">Upload campaign image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('image', e.target.files[0])}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="cursor-pointer">
                        Choose File
                      </Button>
                    </label>
                    {formData.image && (
                      <p className="text-sm text-primary mt-2">{formData.image.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Additional Documents
                  </label>
                  <div className="border-2 border-dashed border-foreground/30 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                    <p className="text-foreground/70 mb-2">Upload project documentation</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file =>
                            handleFileUpload('documents', file)
                          );
                        }
                      }}
                      className="hidden"
                      id="docs-upload"
                    />
                    <label htmlFor="docs-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="cursor-pointer">
                        Choose Files
                      </Button>
                    </label>
                    {formData.documents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.documents.map((doc, index) => (
                          <p key={index} className="text-sm text-primary">{doc.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="px-12 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Campaign...
                  </div>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
