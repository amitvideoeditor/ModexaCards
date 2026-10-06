import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Search,
  Trash2,
  X,
  UserCheck,
  Building,
  Shield,
  CheckCircle2,
  ExternalLink,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TeamMember } from '../types';

export const TeamPage: React.FC = () => {
  const {
    user,
    teamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    updateUserPasswordByAdmin,
    showToast,
    isMobile,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Manager' | 'Field Agent' | 'Support'>('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [modalRole, setModalRole] = useState<TeamMember['role']>('Field Agent');

  // Form State for new member
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newRole, setNewRole] = useState<TeamMember['role']>('Field Agent');
  const [newRegion, setNewRegion] = useState('South Delhi & NCR');
  const [newAssignedCards, setNewAssignedCards] = useState(4);

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.assignedRegion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isAdmin = user.role === 'Admin';
  const canViewAllocations = user.role === 'Admin' || user.role === 'Manager';

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Permission Denied: Only Admin can create new users or IDs.', 'error');
      return;
    }
    if (!newName.trim() || !newEmail.trim()) {
      showToast('Please enter both name and email.', 'error');
      return;
    }

    addTeamMember(
      {
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        role: newRole,
        status: 'Active',
        assignedCards: Number(newAssignedCards) || 0,
        assignedRegion: newRegion.trim() || 'Delhi NCR',
        assignedBy: `${user.name} (${user.role})`,
        assignedCardIds: [],
        activatedCards: [],
      }
    );

    // Reset and close
    setNewName('');
    setNewEmail('');
    setNewPhone('+91 ');
    setNewRole('Field Agent');
    setIsInviteModalOpen(false);
  };

  const getRoleBadgeStyle = (role: TeamMember['role']) => {
    switch (role) {
      case 'Admin':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'Manager':
        return { bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' };
      case 'Field Agent':
        return { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
      case 'Support':
        return { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' };
    }
  };

  const handleOpenMemberDetail = (member: TeamMember) => {
    setSelectedMember(member);
    setModalRole(member.role);
  };

  const handleSaveModalRole = () => {
    if (!selectedMember) return;
    if (user.role !== 'Admin') {
      showToast('Only Admin has permission to change member roles.', 'error');
      return;
    }
    updateTeamMemberRole(selectedMember.id, modalRole);
    setSelectedMember({ ...selectedMember, role: modalRole });
    showToast(`Role updated to ${modalRole} for ${selectedMember.name}.`, 'success');
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Team & Field Agents
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#0B63E5',
                backgroundColor: '#EFF6FF',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {teamMembers.length} Members
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            Manage staff members, field deployment agents, assigned card allocations, and role permissions.
          </p>
        </div>

        {/* Invite CTA Button - STRICTLY ADMIN ONLY AS REQUESTED */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            <UserPlus size={16} strokeWidth={2.5} />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* 4 Summary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Total Members</span>
            <Users size={18} style={{ color: '#0B63E5' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {teamMembers.length}
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 500 }}>Active organization staff</span>
        </div>

        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Field Agents Active</span>
            <UserCheck size={18} style={{ color: '#16A34A' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {teamMembers.filter((m) => m.role === 'Field Agent').length}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>On-ground venue setup</span>
        </div>

        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Assigned Cards</span>
            <CreditCard size={18} style={{ color: '#7C3AED' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {teamMembers.reduce((acc, m) => acc + m.assignedCards, 0)}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Allocated across agents</span>
        </div>

        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Operating Regions</span>
            <Building size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            4 Territories
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Delhi NCR & Gurgaon hub</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="surface-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        {/* Search with 28px rounded pill & Search button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              showToast(`Found ${filteredMembers.length} team members matching "${searchQuery}"`, 'info');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: isMobile ? '100%' : '360px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            borderRadius: '28px',
            padding: '3px 4px 3px 14px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Search size={16} style={{ color: '#64748B', flexShrink: 0, marginRight: '4px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or region..."
            style={{
              flex: 1,
              padding: '7px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        </form>

        {/* Role Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {(['All', 'Admin', 'Manager', 'Field Agent', 'Support'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: roleFilter === role ? 600 : 500,
                backgroundColor: roleFilter === role ? '#0B63E5' : '#F1F5F9',
                color: roleFilter === role ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredMembers.map((member) => {
          const badge = getRoleBadgeStyle(member.role);

          return (
            <div
              key={member.id}
              className="surface-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
              }}
              onClick={() => handleOpenMemberDetail(member)}
            >
              {/* Top Row: Circular Avatar + Name + Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Circular Avatar Photo */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: member.avatarColor || '#0B63E5',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        flexShrink: 0,
                        border: '2px solid #FFFFFF',
                      }}
                    >
                      {member.name.charAt(0)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          {member.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '1px 7px',
                            borderRadius: '9999px',
                          }}
                        >
                          {member.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: member.status === 'Active' ? '#22C55E' : '#F59E0B',
                          }}
                        />
                        <span>{member.status} • Active {member.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button - Only Admin can remove */}
                  {isAdmin && member.role !== 'Admin' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTeamMember(member.id);
                      }}
                      title="Remove member"
                      style={{
                        padding: '6px',
                        color: '#94A3B8',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Contact & Territory details */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: '#94A3B8' }} />
                    <span>{member.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: '#94A3B8' }} />
                    <span>{member.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: '#94A3B8' }} />
                    <span>{member.assignedRegion}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Role Selector (Admin only) & Cards Badge */}
              <div
                style={{
                  paddingTop: '14px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  onClick={() => handleOpenMemberDetail(member)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0B63E5', fontWeight: 600, cursor: 'pointer' }}
                >
                  <CreditCard size={14} style={{ color: '#0B63E5' }} />
                  <span><strong>{member.assignedCards}</strong> Cards Allocated</span>
                  <ArrowRight size={12} />
                </div>

                {/* Role Switcher - STRICTLY ADMIN ONLY AS REQUESTED */}
                {isAdmin ? (
                  <select
                    value={member.role}
                    onChange={(e) => {
                      updateTeamMemberRole(member.id, e.target.value as TeamMember['role']);
                      showToast(`Updated ${member.name}'s role to ${e.target.value}`, 'success');
                    }}
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Field Agent">Field Agent</option>
                    <option value="Support">Support</option>
                  </select>
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {member.role}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MEMBER DETAIL MODAL (Card Assignment & Activation History) */}
      {selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            className="surface-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: selectedMember.avatarColor || '#0B63E5',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '2px solid #FFFFFF',
                  }}
                >
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {selectedMember.name}
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: getRoleBadgeStyle(selectedMember.role).bg,
                        color: getRoleBadgeStyle(selectedMember.role).color,
                        border: `1px solid ${getRoleBadgeStyle(selectedMember.role).border}`,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      {selectedMember.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {selectedMember.email} • {selectedMember.assignedRegion}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* ACCESS RESTRICTION CHECK (Only Admin & Manager can see assignment & activations) */}
            {!canViewAllocations ? (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                <Lock size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                    Admin & Manager Restricted View
                  </div>
                  <p style={{ fontSize: '12px', color: '#B45309', margin: '4px 0 0 0' }}>
                    Card allocation telemetry, assigned card IDs, and field activation logs are exclusively accessible to Administrators (Amit Maurya) and Managers.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* SECTION 1: Card Allocation (Kisne kisko kitna card assign kiya) */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={16} style={{ color: '#0B63E5' }} />
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Card Allocation Details
                      </h4>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0B63E5', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                      {selectedMember.assignedCards} Cards Assigned
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Allocated By: </span>
                      <strong style={{ color: '#0F172A' }}>{selectedMember.assignedBy || 'Amit Maurya (Admin)'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748B' }}>Assigned Card IDs:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {selectedMember.assignedCardIds && selectedMember.assignedCardIds.length > 0 ? (
                          selectedMember.assignedCardIds.map((cardId) => (
                            <span
                              key={cardId}
                              onClick={() => {
                                setSelectedMember(null);
                                navigateTo('business-details', cardId);
                              }}
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                color: '#0B63E5',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                              title="Click to view card details"
                            >
                              {cardId}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                            No specific card batch IDs logged for this member.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Activated Cards in Field (Kaunsa card kiske activate kiya) */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <CheckCircle2 size={16} style={{ color: '#16A34A' }} />
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Activated Cards by {selectedMember.name.split(' ')[0]}
                    </h4>
                  </div>

                  {selectedMember.activatedCards && selectedMember.activatedCards.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedMember.activatedCards.map((act) => (
                        <div
                          key={act.cardId}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                              {act.businessName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontFamily: 'monospace', color: '#0B63E5', fontWeight: 600 }}>{act.cardId}</span>
                              <span>• Activated {act.activatedAt}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMember(null);
                              navigateTo('business-details', act.cardId);
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#0B63E5',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>View</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748B', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                      No on-ground venue activations recorded yet for this agent.
                    </div>
                  )}
                </div>

                {/* SECTION 3: Role Management (Admin hi set karega sabhi ko role) */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Shield size={16} style={{ color: '#7C3AED' }} />
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      System Role Assignment
                    </h4>
                  </div>

                  {isAdmin ? (
                    <div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 10px 0' }}>
                        As Super Administrator (Amit Maurya), you have exclusive authority to assign and adjust permissions.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          value={modalRole}
                          onChange={(e) => setModalRole(e.target.value as TeamMember['role'])}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Field Agent">Field Agent</option>
                          <option value="Support">Support</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleSaveModalRole}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                        >
                          Update Role
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Current Role: <strong style={{ color: '#0F172A' }}>{selectedMember.role}</strong>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                        Role adjustments are restricted exclusively to Super Administrator (Amit Maurya).
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 4: User Account Password Management (Admin Only) */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Lock size={16} style={{ color: '#0B63E5' }} />
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      User Account Password & Access (Admin Only)
                    </h4>
                  </div>

                  {isAdmin ? (
                    <div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 10px 0' }}>
                        As Admin, you can dispatch an official Firebase password reset link to {selectedMember.name} ({selectedMember.email}) so they can securely set or reset their credentials.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await updateUserPasswordByAdmin(selectedMember.email);
                          if (res.success) {
                            showToast(res.message, 'success');
                          } else {
                            showToast(res.message, 'error');
                          }
                        }}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Mail size={14} />
                        <span>Send Password Reset Email</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                        User credentials and password management are restricted exclusively to System Administrators.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Invite Team Member Modal */}
      {isInviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            className="surface-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#0B63E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Add Team Member
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sunil Verma"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sunil.v@modexacards.com"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    System Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as TeamMember['role'])}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Field Agent">Field Agent</option>
                    <option value="Manager">Manager</option>
                    <option value="Support">Support</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assigned Region
                  </label>
                  <input
                    type="text"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    placeholder="e.g. South Delhi"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Cards Allocated
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newAssignedCards}
                    onChange={(e) => setNewAssignedCards(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Mail size={15} style={{ color: '#0B63E5' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                    Firebase Authentication Invitation
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  New members authenticate directly via Firebase Authentication. A password setup invitation link will be sent to their email.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  Save & Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

