import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  X,
  QrCode,
  MapPin,
  User,
  Power,
  RotateCcw,
  Layers,
  AlertCircle,
  Copy,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CardStatusBadge } from '../components/CardStatusBadge';
import { MobileHeader } from '../components/MobileHeader';
import { EditCardSideSection } from '../components/EditCardSideSection';
import { CategoryThumbnailImage } from '../components/CategoryThumbnailImage';

export const CardsPage: React.FC = () => {
  const {
    user,
    cards,
    selectedCardId,
    isActivateModalOpen,
    openActivateModal,
    closeActivateModal,
    navigateTo,
    goBack,
    showToast,
    isMobile,
    globalSearch,
    teamMembers,
    enableCard,
    disableCard,
    canManageInventory,
    canAssignCards,
    canToggleCardStatus,
    deleteCard,
    clearAllCards,
    canDeleteCards,
  } = useApp();

  // Search state
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');

  // 1. Categories: All | Unassigned | Assigned
  const [categoryTab, setCategoryTab] = useState<'All' | 'Unassigned' | 'Assigned'>('All');

  // 2. Filters: Place | Status (Active/Deactive) | Person
  const [placeFilter, setPlaceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [personFilter, setPersonFilter] = useState<string>('All');

  // Dropdown toggles
  const [isPlaceDropdownOpen, setIsPlaceDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);

  // Editing card ID (for desktop split view)
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Active row options dropdown menu
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

  // Deletion modals state (Admin only)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    const handleCloseMenu = () => setActiveRowMenuId(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  const activeEditCardId = editingCardId || (isActivateModalOpen ? (selectedCardId || (cards[0]?.id ?? null)) : null);

  // Sync with globalSearch if set elsewhere
  useEffect(() => {
    if (globalSearch && globalSearch !== searchTerm) {
      setSearchTerm(globalSearch);
    }
  }, [globalSearch]);

  // Derived counts for Category Tabs
  const totalCount = cards.length;
  const unassignedCount = cards.filter((c) => c.status === 'Unassigned').length;
  const assignedCount = cards.filter((c) => c.status !== 'Unassigned').length;

  // Derived lists for filters
  const places = [
    'All',
    ...Array.from(new Set(cards.map((c) => c.location).filter((l): l is string => Boolean(l)))),
  ];

  const persons = [
    'All',
    ...Array.from(
      new Set([
        ...cards.map((c) => c.owner).filter((o): o is string => Boolean(o && o !== '—')),
        ...teamMembers.map((t) => t.name),
      ])
    ),
  ];

  // Filtering Logic
  const term = searchTerm.trim().toLowerCase();
  const filteredCards = cards.filter((card) => {
    // 1. Category Tab: Unassigned vs Assigned vs All
    if (categoryTab === 'Unassigned' && card.status !== 'Unassigned') return false;
    if (categoryTab === 'Assigned' && card.status === 'Unassigned') return false;

    // 2. Place Filter
    if (placeFilter !== 'All' && card.location !== placeFilter) return false;

    // 3. Status Filter (Active / Deactive)
    if (statusFilter === 'Active' && card.status !== 'Active') return false;
    if (statusFilter === 'Inactive' && card.status !== 'Inactive') return false;
    if (statusFilter === 'Unassigned' && card.status !== 'Unassigned') return false;

    // 4. Person Filter
    if (personFilter !== 'All') {
      if (card.owner !== personFilter) return false;
    }

    // 5. Search Text matching ID, business name, category, owner, location
    if (term) {
      const match =
        card.id.toLowerCase().includes(term) ||
        (card.businessName && card.businessName.toLowerCase().includes(term)) ||
        (card.category && card.category.toLowerCase().includes(term)) ||
        (card.owner && card.owner.toLowerCase().includes(term)) ||
        (card.location && card.location.toLowerCase().includes(term));
      if (!match) return false;
    }

    return true;
  });

  const isAnyFilterActive =
    categoryTab !== 'All' ||
    placeFilter !== 'All' ||
    statusFilter !== 'All' ||
    personFilter !== 'All' ||
    searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setCategoryTab('All');
    setPlaceFilter('All');
    setStatusFilter('All');
    setPersonFilter('All');
    setSearchTerm('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const closeAllDropdowns = () => {
    setIsPlaceDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setIsPersonDropdownOpen(false);
  };

  // ========================================================
  // MOBILE CARDS VIEW
  // ========================================================
  if (isMobile) {
    return (
      <div style={{ paddingBottom: '90px', backgroundColor: '#FFFFFF', minHeight: '100%' }}>
        <MobileHeader
          type="detail"
          title="Cards Management"
          showBack
          onBack={goBack}
          showNotification
        />

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Category Tabs (Pills) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px',
            }}
          >
            {(['All', 'Unassigned', 'Assigned'] as const).map((tab) => {
              const isActive = categoryTab === tab;
              const count = tab === 'All' ? totalCount : tab === 'Unassigned' ? unassignedCount : assignedCount;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategoryTab(tab)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#0B63E5' : '#64748B',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '12.5px',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab}</span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#EFF6FF' : '#E2E8F0',
                      color: isActive ? '#0B63E5' : '#475569',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Row & Admin Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '28px',
                padding: '3px 4px 3px 12px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              }}
            >
              <Search size={16} style={{ color: '#64748B', flexShrink: 0, marginRight: '4px' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search card ID, place, owner..."
                style={{
                  flex: 1,
                  padding: '7px 6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
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
                  padding: '6px 12px',
                  fontSize: '12px',
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

            {canAssignCards && (
              <button
                type="button"
                onClick={() => {
                  const unassigned = cards.find((c) => c.status === 'Unassigned');
                  if (unassigned) {
                    setEditingCardId(unassigned.id);
                    openActivateModal(unassigned.id);
                  } else if (cards.length > 0) {
                    setEditingCardId(cards[0].id);
                    openActivateModal(cards[0].id);
                  } else {
                    showToast('No cards in inventory to assign.', 'warning');
                  }
                }}
                className="btn-primary"
                style={{
                  padding: '8px 13px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  flexShrink: 0,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <Plus size={14} />
                <span>+ Assign Card</span>
              </button>
            )}
          </div>

          {/* Filter Pills on Mobile: Place, Status, Person */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {/* Status Quick Filter */}
            {(['All', 'Active', 'Inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11.5px',
                  fontWeight: statusFilter === s ? 700 : 500,
                  backgroundColor: statusFilter === s ? '#0B63E5' : '#F1F5F9',
                  color: statusFilter === s ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {s === 'All' ? 'All Status' : s === 'Inactive' ? 'Deactive' : s}
              </button>
            ))}

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: '#DC2626',
                  backgroundColor: '#FEE2E2',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Cards List or Empty State */}
          {cards.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1.5px dashed #CBD5E1',
                marginTop: '10px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#0B63E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                }}
              >
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                Inventory is Empty (0 Cards)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px 0', lineHeight: 1.4 }}>
                All previous cards have been cleared. Generate bulk cards or add single cards to populate your stock.
              </p>
              {user.role === 'Admin' && (
                <button
                  type="button"
                  onClick={() => navigateTo('create-cards')}
                  className="btn-primary"
                  style={{ borderRadius: '10px', padding: '10px 18px', fontSize: '13px' }}
                >
                  <QrCode size={15} />
                  <span>Generate New Cards</span>
                </button>
              )}
            </div>
          ) : filteredCards.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
              }}
            >
              <AlertCircle size={28} style={{ color: '#94A3B8', margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>No matching cards found</div>
              <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px', marginBottom: '14px' }}>
                Try adjusting your category or filter selections.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCards.map((card) => {
                const isUnassigned = card.status === 'Unassigned';
                const canToggle = canToggleCardStatus(card);

                return (
                  <div
                    key={card.id}
                    className="surface-card"
                    style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CategoryThumbnailImage
                          category={card.category}
                          thumbnail={card.thumbnail}
                          businessName={card.businessName}
                          size={42}
                          borderRadius={10}
                        />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {card.businessName || 'Unassigned Stock'}
                          </h4>
                          <div style={{ fontSize: '12px', color: '#0B63E5', fontWeight: 600 }}>
                            {card.id} •{' '}
                            <span style={{ color: '#64748B', fontWeight: 500 }}>
                              {card.location || 'New Delhi'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <CardStatusBadge status={card.status} size="sm" />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid #F1F5F9',
                        fontSize: '12px',
                        color: '#64748B',
                      }}
                    >
                      <div>
                        <span>Assigned to: </span>
                        <strong style={{ color: !card.owner || card.owner === '—' ? '#94A3B8' : '#0F172A' }}>
                          {!card.owner || card.owner === '—' ? 'Unassigned' : card.owner}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Status Toggle Button for Authorized Users */}
                        {!isUnassigned && canToggle && (
                          <button
                            type="button"
                            onClick={() => {
                              if (card.status === 'Active') {
                                disableCard(card.id);
                              } else {
                                enableCard(card.id);
                              }
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: card.status === 'Active' ? '#FEF2F2' : '#EFF6FF',
                              color: card.status === 'Active' ? '#DC2626' : '#0B63E5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Power size={11} />
                            <span>{card.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        )}

                        {isUnassigned ? (
                          canAssignCards ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCardId(card.id);
                                openActivateModal(card.id);
                              }}
                              className="btn-primary"
                              style={{ padding: '5px 12px', fontSize: '11px', borderRadius: '6px' }}
                            >
                              Assign Card
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 600 }}>
                              Unassigned
                            </span>
                          )
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCardId(card.id);
                                openActivateModal(card.id);
                              }}
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateTo('business-details', card.id)}
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px' }}
                            >
                              Manage
                            </button>
                          </div>
                        )}

                        {canDeleteCards && (
                          <button
                            type="button"
                            onClick={() => setCardToDelete(card.id)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: '1px solid #FECACA',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Admin: Delete Card"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // DESKTOP CARDS MANAGEMENT
  // ========================================================
  return (
    <div style={{ padding: '24px 32px' }} onClick={closeAllDropdowns}>
      {/* Main Split Layout: Left Section (Header + Controls + Table) and Right Section (Edit Panel) */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* 1st SECTION (Left Column): Header, Category Tabs, Filters, and Table */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Header inside 1st Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                Cards Management & Inventory
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                Filter by category, place, status, or assigned person. Admin and Managers can add stock and assign cards.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {canManageInventory && (
                <button
                  type="button"
                  onClick={() => navigateTo('create-cards')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 16px',
                    backgroundColor: '#EFF6FF',
                    color: '#0B63E5',
                    border: '1px solid #BFDBFE',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                >
                  <QrCode size={16} />
                  <span>+ Create Cards (Bulk QR)</span>
                </button>
              )}

              {canManageInventory && (
                <button
                  type="button"
                  onClick={() => {
                    const unassigned = cards.find((c) => c.status === 'Unassigned');
                    if (unassigned) {
                      setEditingCardId(unassigned.id);
                    } else if (cards.length > 0) {
                      setEditingCardId(cards[0].id);
                    } else {
                      navigateTo('create-cards');
                    }
                  }}
                  className="btn-primary"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Activate / Add Card</span>
                </button>
              )}

              {canDeleteCards && cards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 15px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                  title="Admin Action: Delete all cards in inventory"
                >
                  <Trash2 size={16} />
                  <span>Delete All Cards</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================
              CATEGORY TABS: ALL | UNASSIGNED | ASSIGNED
              ======================================================== */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '6px',
              gap: '6px',
              marginBottom: '16px',
              width: 'fit-content',
            }}
          >
            {(['All', 'Unassigned', 'Assigned'] as const).map((tab) => {
              const isActive = categoryTab === tab;
              const count = tab === 'All' ? totalCount : tab === 'Unassigned' ? unassignedCount : assignedCount;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategoryTab(tab)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#0B63E5' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab === 'All' ? 'All Cards' : tab}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#FFFFFF' : '#F1F5F9',
                      color: isActive ? '#0B63E5' : '#475569',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ========================================================
              FILTER BAR: SEARCH + PLACE + STATUS + PERSON + RESET
              ======================================================== */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '18px',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input with 28px rounded pill */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                minWidth: '280px',
                maxWidth: '380px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '28px',
                padding: '4px 6px 4px 14px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              }}
            >
              <Search size={16} style={{ color: '#64748B', flexShrink: 0, marginRight: '4px' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, business, place, person..."
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
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  borderRadius: '22px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Search size={14} />
                <span>Search</span>
              </button>
            </form>

            {/* Filters Group: Place, Status (Active/Deactive), Person */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* 1. Place Filter Dropdown */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaceDropdownOpen((prev) => !prev);
                    setIsStatusDropdownOpen(false);
                    setIsPersonDropdownOpen(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: placeFilter !== 'All' ? '#EFF6FF' : '#FFFFFF',
                    border: placeFilter !== 'All' ? '1.5px solid #0B63E5' : '1px solid #CBD5E1',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: placeFilter !== 'All' ? 600 : 500,
                    color: placeFilter !== 'All' ? '#0B63E5' : '#0F172A',
                    cursor: 'pointer',
                  }}
                >
                  <MapPin size={13} style={{ color: placeFilter !== 'All' ? '#0B63E5' : '#64748B' }} />
                  <span>{placeFilter === 'All' ? 'Place: All' : placeFilter}</span>
                  <ChevronDown size={14} style={{ color: '#64748B' }} />
                </button>

                {isPlaceDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '6px',
                      width: '180px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      padding: '4px',
                      zIndex: 30,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      fontSize: '13px',
                    }}
                  >
                    {places.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPlaceFilter(p);
                          setIsPlaceDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          color: placeFilter === p ? '#0B63E5' : '#0F172A',
                          fontWeight: placeFilter === p ? 600 : 400,
                          backgroundColor: placeFilter === p ? '#EFF6FF' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {p === 'All' ? 'All Places' : p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Status Filter Dropdown (Active / Deactive) */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusDropdownOpen((prev) => !prev);
                    setIsPlaceDropdownOpen(false);
                    setIsPersonDropdownOpen(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: statusFilter !== 'All' ? '#EFF6FF' : '#FFFFFF',
                    border: statusFilter !== 'All' ? '1.5px solid #0B63E5' : '1px solid #CBD5E1',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: statusFilter !== 'All' ? 600 : 500,
                    color: statusFilter !== 'All' ? '#0B63E5' : '#0F172A',
                    cursor: 'pointer',
                  }}
                >
                  <Power size={13} style={{ color: statusFilter !== 'All' ? '#0B63E5' : '#64748B' }} />
                  <span>
                    {statusFilter === 'All'
                      ? 'Status: All'
                      : statusFilter === 'Inactive'
                      ? 'Status: Deactive'
                      : `Status: ${statusFilter}`}
                  </span>
                  <ChevronDown size={14} style={{ color: '#64748B' }} />
                </button>

                {isStatusDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '6px',
                      width: '150px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      padding: '4px',
                      zIndex: 30,
                      fontSize: '13px',
                    }}
                  >
                    {[
                      { key: 'All', label: 'All Status' },
                      { key: 'Active', label: 'Active' },
                      { key: 'Inactive', label: 'Deactive (Inactive)' },
                      { key: 'Unassigned', label: 'Unassigned' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setStatusFilter(item.key);
                          setIsStatusDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          color: statusFilter === item.key ? '#0B63E5' : '#0F172A',
                          fontWeight: statusFilter === item.key ? 600 : 400,
                          backgroundColor: statusFilter === item.key ? '#EFF6FF' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Person Filter Dropdown */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPersonDropdownOpen((prev) => !prev);
                    setIsPlaceDropdownOpen(false);
                    setIsStatusDropdownOpen(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: personFilter !== 'All' ? '#EFF6FF' : '#FFFFFF',
                    border: personFilter !== 'All' ? '1.5px solid #0B63E5' : '1px solid #CBD5E1',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: personFilter !== 'All' ? 600 : 500,
                    color: personFilter !== 'All' ? '#0B63E5' : '#0F172A',
                    cursor: 'pointer',
                  }}
                >
                  <User size={13} style={{ color: personFilter !== 'All' ? '#0B63E5' : '#64748B' }} />
                  <span>{personFilter === 'All' ? 'Person: All' : `Person: ${personFilter}`}</span>
                  <ChevronDown size={14} style={{ color: '#64748B' }} />
                </button>

                {isPersonDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '6px',
                      width: '200px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      padding: '4px',
                      zIndex: 30,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      fontSize: '13px',
                    }}
                  >
                    {persons.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPersonFilter(p);
                          setIsPersonDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          color: personFilter === p ? '#0B63E5' : '#0F172A',
                          fontWeight: personFilter === p ? 600 : 400,
                          backgroundColor: personFilter === p ? '#EFF6FF' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {p === 'All' ? 'All Persons' : p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Filters Chip */}
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 12px',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#DC2626',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================
              INVENTORY TABLE & EMPTY STATES
              ======================================================== */}
          {cards.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px dashed #CBD5E1',
                padding: '60px 32px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#0B63E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Layers size={32} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Inventory is Empty (0 Cards)
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                All previous mock cards have been cleared. When you generate 50 or 100 cards in bulk, click <strong>"Add these cards to Inventory"</strong> and all cards will list here as <strong>Unassigned</strong>.
              </p>
              {canManageInventory ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => navigateTo('create-cards')}
                    className="btn-primary"
                    style={{ borderRadius: '10px', padding: '10px 20px', fontSize: '13.5px' }}
                  >
                    <QrCode size={16} />
                    <span>+ Generate Bulk QR Cards (Vendor Order)</span>
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                  Please ask an Admin or Manager to generate and assign cards to you.
                </span>
              )}
            </div>
          ) : filteredCards.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={32} style={{ color: '#94A3B8', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                No cards match your filter criteria
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
                Try selecting a different category, place, status, or person filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="surface-card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <th style={{ width: '15%' }}>Card ID</th>
                    <th style={{ width: '24%' }}>Business / Standee</th>
                    <th style={{ width: '13%' }}>Place</th>
                    <th style={{ width: '13%' }}>Status</th>
                    <th style={{ width: '17%' }}>Assigned Person</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>Active / Deactive & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => {
                    const isUnassigned = card.status === 'Unassigned';
                    const isSelectedForEdit = activeEditCardId === card.id;
                    const canToggle = canToggleCardStatus(card);

                    return (
                      <tr
                        key={card.id}
                        style={{
                          backgroundColor: isSelectedForEdit ? '#EFF6FF' : undefined,
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* 1. Card ID */}
                        <td>
                          <button
                            type="button"
                            onClick={() => setEditingCardId(card.id)}
                            style={{
                              color: '#0B63E5',
                              fontWeight: 700,
                              fontSize: '13.5px',
                              fontFamily: 'monospace',
                              cursor: 'pointer',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              padding: 0,
                            }}
                          >
                            {card.id}
                          </button>
                        </td>

                        {/* 2. Business */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CategoryThumbnailImage
                              category={card.category}
                              thumbnail={card.thumbnail}
                              businessName={card.businessName}
                              size={34}
                              borderRadius={8}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                                {card.businessName || 'Unassigned Stock'}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                {card.category || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Place */}
                        <td style={{ color: '#475569', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
                            <span>{card.location || 'New Delhi'}</span>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td>
                          <CardStatusBadge status={card.status} size="sm" />
                        </td>

                        {/* 5. Assigned Person */}
                        <td>
                          {isUnassigned ? (
                            <span
                              style={{
                                fontSize: '12px',
                                color: '#94A3B8',
                                fontStyle: 'italic',
                              }}
                            >
                              Unassigned
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={13} style={{ color: '#0B63E5' }} />
                              <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                                {card.owner}
                              </strong>
                            </div>
                          )}
                        </td>

                        {/* 6. Active / Deactive Toggle + Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* Unassigned Action: Assign Card (Admin/Manager only) */}
                            {isUnassigned ? (
                              canAssignCards ? (
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(card.id)}
                                  className="btn-primary"
                                  style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px' }}
                                >
                                  Assign Card
                                </button>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                                  Stock
                                </span>
                              )
                            ) : (
                              <>
                                {/* Active / Deactive Toggle for Assigned Persons & Admins */}
                                {canToggle && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (card.status === 'Active') {
                                        disableCard(card.id);
                                      } else {
                                        enableCard(card.id);
                                      }
                                    }}
                                    title={
                                      card.status === 'Active'
                                        ? 'Click to Deactivate Card'
                                        : 'Click to Activate Card'
                                    }
                                    style={{
                                      padding: '5px 10px',
                                      fontSize: '11px',
                                      borderRadius: '6px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      border: 'none',
                                      backgroundColor:
                                        card.status === 'Active' ? '#FEF2F2' : '#ECFDF5',
                                      color:
                                        card.status === 'Active' ? '#DC2626' : '#059669',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <Power size={11} />
                                    <span>{card.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                                  </button>
                                )}

                                {/* Edit Button for Admins & Managers */}
                                {canAssignCards && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingCardId(card.id)}
                                    className={isSelectedForEdit ? 'btn-primary' : 'btn-secondary'}
                                    style={{
                                      padding: '5px 9px',
                                      fontSize: '11px',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                    title="Edit card details or reassign person"
                                  >
                                    <Pencil size={11} />
                                    <span>Edit</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => navigateTo('business-details', card.id)}
                                  className="btn-secondary"
                                  style={{ padding: '5px 9px', fontSize: '11px', borderRadius: '6px' }}
                                >
                                  Manage
                                </button>
                              </>
                            )}

                            <div style={{ position: 'relative' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveRowMenuId(activeRowMenuId === card.id ? null : card.id);
                                }}
                                style={{
                                  padding: '4px 6px',
                                  color: activeRowMenuId === card.id ? '#2563EB' : '#94A3B8',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: activeRowMenuId === card.id ? '#EFF6FF' : 'transparent',
                                  cursor: 'pointer',
                                }}
                                title="More options"
                              >
                                <MoreHorizontal size={15} />
                              </button>

                              {activeRowMenuId === card.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '6px',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #E2E8F0',
                                    padding: '6px',
                                    minWidth: '175px',
                                    zIndex: 50,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveRowMenuId(null);
                                      window.open(`/r/${card.id}`, '_blank');
                                    }}
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 10px',
                                      fontSize: '12px',
                                      color: '#334155',
                                      background: 'none',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <ExternalLink size={13} color="#2563EB" />
                                    <span>Open Public Link</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveRowMenuId(null);
                                      navigator.clipboard.writeText(card.id);
                                      showToast(`Copied ${card.id} to clipboard`, 'success');
                                    }}
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 10px',
                                      fontSize: '12px',
                                      color: '#334155',
                                      background: 'none',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <Copy size={13} color="#64748B" />
                                    <span>Copy Card ID</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveRowMenuId(null);
                                      if (card.status === 'Unassigned') {
                                        openActivateModal(card.id);
                                      } else {
                                        setEditingCardId(card.id);
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 10px',
                                      fontSize: '12px',
                                      color: '#334155',
                                      background: 'none',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <Pencil size={13} color="#64748B" />
                                    <span>{card.status === 'Unassigned' ? 'Assign Card' : 'Edit Details'}</span>
                                  </button>

                                  {canDeleteCards && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveRowMenuId(null);
                                        setCardToDelete(card.id);
                                      }}
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 10px',
                                        fontSize: '12px',
                                        color: '#DC2626',
                                        background: 'none',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                      <Trash2 size={13} color="#DC2626" />
                                      <span>Delete Card</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Embedded Edit Section (Top aligned strictly with 1st section) */}
        {activeEditCardId && (
          <EditCardSideSection
            cardId={activeEditCardId}
            onClose={() => {
              setEditingCardId(null);
              closeActivateModal();
            }}
          />
        )}
      </div>

      {/* Modal: Single Card Delete Confirmation */}
      {cardToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => !isDeletingSingle && setCardToDelete(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Delete Card {cardToDelete}?
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  This action is permanent and cannot be undone.
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Are you sure you want to permanently delete card <strong style={{ color: '#0F172A' }}>{cardToDelete}</strong> from Firestore inventory? Its QR and NFC redirect link will stop working immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                disabled={isDeletingSingle}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!cardToDelete) return;
                  setIsDeletingSingle(true);
                  try {
                    const success = await deleteCard(cardToDelete);
                    if (success) {
                      setCardToDelete(null);
                    }
                  } finally {
                    setIsDeletingSingle(false);
                  }
                }}
                disabled={isDeletingSingle}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: isDeletingSingle ? 'not-allowed' : 'pointer',
                  opacity: isDeletingSingle ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isDeletingSingle ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Card</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete All Cards Confirmation */}
      {isDeleteAllModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => !isDeletingAll && setIsDeleteAllModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #FECACA',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                  Delete ALL Cards in Inventory?
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Admin Action • Irreversible Batch Deletion
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '13px', color: '#991B1B', margin: 0, lineHeight: 1.5 }}>
                You are about to permanently delete <strong>{cards.length} cards</strong> from the Firestore database. All assigned businesses, URLs, and redirect routes will be permanently removed.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                disabled={isDeletingAll}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeletingAll(true);
                  try {
                    const success = await clearAllCards();
                    if (success) {
                      setIsDeleteAllModalOpen(false);
                    }
                  } finally {
                    setIsDeletingAll(false);
                  }
                }}
                disabled={isDeletingAll}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: isDeletingAll ? 'not-allowed' : 'pointer',
                  opacity: isDeletingAll ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isDeletingAll ? (
                  <span>Deleting All Cards...</span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete All ({cards.length}) Cards</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
