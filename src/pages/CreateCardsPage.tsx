import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import {
  QrCode,
  Layers,
  Printer,
  Download,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  Sparkles,
  Archive,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MobileHeader } from '../components/MobileHeader';
import { GoogleReviewAcrylicStand } from '../components/GoogleReviewAcrylicStand';
import type { CardItem, CardStatus } from '../types';
import { BUSINESS_CATEGORIES, getCategoryThumbnail } from '../data/categoryThumbnails';

interface GeneratedCardData {
  id: string;
  number: number;
  dynamicUrl: string;
  qrDataUrl: string;
  status: CardStatus;
  style: 'midnight' | 'white' | 'standee';
  businessName?: string;
  category?: string;
}

export const CreateCardsPage: React.FC = () => {
  const {
    user,
    cards,
    addBatchCards,
    addNewSingleCard,
    navigateTo,
    goBack,
    showToast,
    isMobile,
    canManageInventory,
  } = useApp();

  // Mode: 'bulk' | 'single' | 'print-sheet'
  const [activeTab, setActiveTab] = useState<'bulk' | 'single' | 'print-sheet'>('bulk');

  // Sequential numbering calculation from existing cards
  const nextSeqNumber = useMemo(() => {
    let maxNum = 0;
    cards.forEach((c) => {
      const match = c.id.match(/\d+$/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (!isNaN(val) && val > maxNum) {
          maxNum = val;
        }
      }
    });
    return maxNum + 1;
  }, [cards]);

  // Bulk Generator States - Starts sequentially from 1 (0001) as requested
  const [prefix, setPrefix] = useState('CRD-');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(20);
  const [paddingDigits, setPaddingDigits] = useState<number>(4);
  const [cardStyle, setCardStyle] = useState<'midnight' | 'white' | 'standee'>('standee');
  const [initialStatus, setInitialStatus] = useState<CardStatus>('Unassigned');
  const [batchNote, setBatchNote] = useState(`Vendor Print Order - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<GeneratedCardData[]>([]);
  const [isSavedToInventory, setIsSavedToInventory] = useState(false);
  const [startCardQrUrl, setStartCardQrUrl] = useState<string>('');

  // Single Card States
  const [singleId, setSingleId] = useState('CRD-0001');
  const [singleBusinessName, setSingleBusinessName] = useState('');
  const [singleCategory, setSingleCategory] = useState('Healthcare & Wellness');
  const [singleStyle, setSingleStyle] = useState<'midnight' | 'white' | 'standee'>('standee');
  const [singleStatus, setSingleStatus] = useState<CardStatus>('Unassigned');
  const [singleQrDataUrl, setSingleQrDataUrl] = useState('');

  // Auto-increment Single ID handler on each click
  const handleNextSingleId = () => {
    const match = singleId.trim().match(/^(.*?)(\d+)$/);
    if (match) {
      const curPrefix = match[1] || prefix;
      const curNum = parseInt(match[2], 10);
      const digitLen = Math.max(match[2].length, paddingDigits);
      const nextNum = curNum + 1;
      setSingleId(`${curPrefix}${String(nextNum).padStart(digitLen, '0')}`);
    } else {
      const nextNum = Math.max(1, nextSeqNumber);
      setSingleId(`${prefix}${String(nextNum).padStart(paddingDigits, '0')}`);
    }
  };

  // Print Sheet Options
  const [showCutMarks, setShowCutMarks] = useState(true);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Computed Range IDs for Live Preview
  const endNumber = startNumber + quantity - 1;
  const startCardIdPreview = `${prefix}${String(startNumber).padStart(paddingDigits, '0')}`;
  const endCardIdPreview = `${prefix}${String(endNumber).padStart(paddingDigits, '0')}`;

  // Dynamic URL builder - Hosted on Firebase at https://modexacards.web.app/r/{cardId}
  const buildDynamicUrl = (cardId: string) => {
    return `https://modexacards.web.app/r/${encodeURIComponent(cardId)}`;
  };

  // Generate QR for Bulk Starting Card Preview (Live Update)
  useEffect(() => {
    let isCancelled = false;
    const url = buildDynamicUrl(startCardIdPreview);
    QRCode.toDataURL(url, {
      margin: 1,
      width: 500,
      color: {
        dark: cardStyle === 'midnight' ? '#000000' : '#0B63E5',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => {
        if (!isCancelled) {
          setStartCardQrUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.error('Failed to generate start card QR:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [startCardIdPreview, cardStyle]);

  // Generate QR for Single Card Preview
  useEffect(() => {
    let isCancelled = false;
    const url = buildDynamicUrl(singleId);
    QRCode.toDataURL(url, {
      margin: 1,
      width: 500,
      color: {
        dark: singleStyle === 'midnight' ? '#000000' : '#0B63E5',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => {
        if (!isCancelled) {
          setSingleQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.error('Failed to generate single QR:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [singleId, singleStyle]);

  // Auto-advance start number to next available sequential number when cards load
  useEffect(() => {
    if (cards.length > 0 && nextSeqNumber > 1 && startNumber === 1) {
      setStartNumber(nextSeqNumber);
    }
  }, [cards.length, nextSeqNumber]);

  // Bulk Generation Execution
  const handleGenerateBulk = async () => {
    if (quantity <= 0 || quantity > 500) {
      showToast('Quantity must be between 1 and 500 cards.', 'warning');
      return;
    }

    setIsGenerating(true);
    setIsSavedToInventory(false);

    try {
      const items: GeneratedCardData[] = [];
      for (let i = 0; i < quantity; i++) {
        const curNum = startNumber + i;
        const cardId = `${prefix}${String(curNum).padStart(paddingDigits, '0')}`;
        const dynamicUrl = buildDynamicUrl(cardId);

        const qrDataUrl = await QRCode.toDataURL(dynamicUrl, {
          margin: 1,
          width: 500,
          color: {
            dark: cardStyle === 'midnight' ? '#000000' : '#0B63E5',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });

        // Bulk-generated cards are strictly Unassigned physical inventory with NO dummy business details
        items.push({
          id: cardId,
          number: curNum,
          dynamicUrl,
          qrDataUrl,
          status: 'Unassigned',
          style: cardStyle,
        });
      }

      setGeneratedBatch(items);
      showToast(`Generated ${items.length} unique dynamic QR cards (${items[0].id} to ${items[items.length - 1].id})!`, 'success');
    } catch (err) {
      console.error('Bulk generation error:', err);
      showToast('Failed to generate batch QR codes.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Bulk Batch to System Inventory
  const handleSaveBatchToInventory = async () => {
    if (generatedBatch.length === 0) return;

    // Skip any IDs that already exist in local state to prevent overwriting
    const existingIds = new Set(cards.map((c) => c.id.trim().toUpperCase()));
    const validBatchItems = generatedBatch.filter(
      (item) => !existingIds.has(item.id.trim().toUpperCase())
    );

    if (validBatchItems.length === 0) {
      showToast(
        `All ${generatedBatch.length} generated cards already exist in inventory. Skipped to preserve existing data.`,
        'info'
      );
      setIsSavedToInventory(true);
      return;
    }

    // ONLY the initial unassigned physical inventory fields:
    // - id: e.g. "CRD-0002"
    // - status: "Unassigned"
    // - qrScans: 0
    // - nfcTaps: 0
    // - createdAt
    // NO dummy businessId, businessName, googleReviewUrl, category, location, owner, phone, thumbnail
    const newCards: CardItem[] = validBatchItems.map((item) => ({
      id: item.id.trim(),
      status: 'Unassigned',
      qrScans: 0,
      nfcTaps: 0,
      createdAt: new Date().toISOString(),
    }));

    await addBatchCards(newCards, batchNote);
    setIsSavedToInventory(true);
  };

  // Save Single Card to System Inventory
  const handleSaveSingleCard = async () => {
    const cleanId = singleId.trim();
    if (cards.some((c) => c.id.trim().toLowerCase() === cleanId.toLowerCase())) {
      showToast(`Card ID ${cleanId} already exists in inventory. Please choose a new ID.`, 'error');
      return;
    }

    const newCard: CardItem = {
      id: cleanId,
      businessId: `biz-${cleanId.toLowerCase()}`,
      businessName: singleBusinessName.trim() || 'Unassigned Stock',
      category: singleCategory,
      location: 'New Delhi',
      status: singleStatus,
      owner: singleBusinessName.trim() ? user.name : '—',
      phone: '',
      lastActivity: 'Just created',
      qrScans: 0,
      nfcTaps: 0,
      googleReviewUrl: buildDynamicUrl(cleanId),
      thumbnail: getCategoryThumbnail(singleCategory, undefined, singleBusinessName.trim()),
    };

    await addNewSingleCard(newCard);
    // Automatically advance to the next sequential ID
    handleNextSingleId();
  };

  // Download Single QR Code as High-Res PNG
  const handleDownloadSingleQR = () => {
    if (!singleQrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${singleId}_Dynamic_QR.png`;
    link.href = singleQrDataUrl;
    link.click();
    showToast(`Downloaded high-res QR for ${singleId}`, 'success');
  };

  // Download CSV for Printing Vendor Machine / Laser Engraver
  const handleDownloadVendorCSV = () => {
    if (generatedBatch.length === 0) return;

    let csv = 'Card ID,Sequence Number,Dynamic Destination URL,NFC Payload URL,Print Style,Status,Generated By\n';
    generatedBatch.forEach((item) => {
      csv += `"${item.id}","${item.number}","${item.dynamicUrl}","${item.dynamicUrl}","${item.style}","${item.status}","${user.name}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Modexa_TapCard_Print_Order_${generatedBatch[0].id}_to_${generatedBatch[generatedBatch.length - 1].id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Vendor machine order CSV exported successfully!', 'success');
  };

  // Trigger Native Browser Print Dialog (Save as PDF)
  const handlePrintToPDF = () => {
    if (generatedBatch.length === 0) {
      showToast('Generate a batch first to export print sheet.', 'warning');
      return;
    }
    // Switch to print-sheet view first so preview is rendered
    setActiveTab('print-sheet');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Option 1: Export Bulk Batch as Ultra-HD PNG Images packed in a ZIP Archive (Crisp & Zero Blurriness)
  const handleExportQRZip = async () => {
    if (generatedBatch.length === 0) {
      showToast('Generate a batch first before exporting ZIP.', 'warning');
      return;
    }

    setIsExportingZip(true);
    showToast(`Generating Ultra-HD PNG images & packing ZIP (${generatedBatch.length} cards)...`, 'info');

    try {
      // Yield to UI to render toast
      await new Promise((resolve) => setTimeout(resolve, 80));

      const zip = new JSZip();
      const folderName = `Modexa_Cards_HD_PNG_${generatedBatch[0].id}_to_${generatedBatch[generatedBatch.length - 1].id}`;
      const folder = zip.folder(folderName);

      let manifestContent = `========================================================================\n`;
      manifestContent += `  MODEXA TAPCARD ENTERPRISE - HD PNG QR EXPORT\n`;
      manifestContent += `========================================================================\n`;
      manifestContent += `Generated On  : ${new Date().toLocaleString()}\n`;
      manifestContent += `Total Cards   : ${generatedBatch.length}\n`;
      manifestContent += `Resolution    : 1080 x 1080 Pixels (High-Quality Crisp Print Ready)\n`;
      manifestContent += `Format        : Lossless PNG with High Error Correction (Level H)\n`;
      manifestContent += `Card ID Range : ${generatedBatch[0].id} to ${generatedBatch[generatedBatch.length - 1].id}\n`;
      manifestContent += `Redirect Domain: https://modexacards.web.app\n`;
      manifestContent += `------------------------------------------------------------------------\n\n`;
      manifestContent += `CARD ID       | DYNAMIC DESTINATION URL\n`;
      manifestContent += `------------------------------------------------------------------------\n`;

      for (const card of generatedBatch) {
        // High-definition 1080x1080 QR code for crisp quality and optimized file size
        const hdQrDataUrl = await QRCode.toDataURL(card.dynamicUrl, {
          width: 1080,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        // Strip prefix data:image/png;base64,
        const base64Data = hdQrDataUrl.replace(/^data:image\/png;base64,/, '');
        folder?.file(`${card.id}.png`, base64Data, { base64: true });

        manifestContent += `${card.id.padEnd(14)}| ${card.dynamicUrl}\n`;
      }

      folder?.file('manifest.txt', manifestContent);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const filename = `Modexa_Cards_HD_PNG_${generatedBatch[0].id}_to_${generatedBatch[generatedBatch.length - 1].id}.zip`;
      const link = document.createElement('a');
      const url = URL.createObjectURL(zipBlob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Downloaded ZIP with ${generatedBatch.length} HD PNGs (1080x1080)!`, 'success');
    } catch (err) {
      console.error('ZIP generation error:', err);
      showToast('Failed to export ZIP archive.', 'error');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Option 2: Export Bulk Batch as 1 QR Code Per Page PDF (Square format, ready to use, no text, no numbers)
  const handleExportQRPDF = async () => {
    if (generatedBatch.length === 0) {
      showToast('Generate a batch first before exporting PDF.', 'warning');
      return;
    }

    setIsExportingPDF(true);
    showToast(`Generating ${generatedBatch.length}-page square QR PDF (Ultra-HD)...`, 'info');

    try {
      // Yield to UI to render toast
      await new Promise((resolve) => setTimeout(resolve, 80));

      // Square page format: 100mm x 100mm (standard ready-to-use print format)
      const pageSize = 100;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageSize, pageSize],
      });

      const qrMargin = 8; // 8mm white quiet zone margin around QR
      const qrSize = pageSize - qrMargin * 2; // 84mm x 84mm high-res QR code

      for (let idx = 0; idx < generatedBatch.length; idx++) {
        const card = generatedBatch[idx];
        if (idx > 0) {
          doc.addPage([pageSize, pageSize], 'portrait');
        }

        // Render at 1600px width with High Error Correction so PDF print is crisp and never blurry
        const hdQrDataUrl = await QRCode.toDataURL(card.dynamicUrl, {
          width: 1600,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        // PURE QR CODE ONLY - Absolutely NO text, NO numbers, NO decorations, NO lines
        doc.addImage(hdQrDataUrl, 'PNG', qrMargin, qrMargin, qrSize, qrSize);
      }

      const filename = `Modexa_QR_${generatedBatch[0].id}_to_${generatedBatch[generatedBatch.length - 1].id}_${generatedBatch.length}pages.pdf`;
      doc.save(filename);
      showToast(`Downloaded ${generatedBatch.length}-page square QR PDF!`, 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Failed to export PDF file.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // ========================================================
  // 1. ADMIN AUTHORIZATION SHIELD GUARD
  // ========================================================
  // ACCESS RESTRICTION: Admin & Manager Only
  // ========================================================
  if (!canManageInventory) {
    return (
      <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)',
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          Admin & Manager Access Required
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '440px', lineHeight: 1.6, marginBottom: '24px' }}>
          The <strong>Create Cards</strong> and <strong>Bulk Dynamic QR Generation</strong> engine is restricted to Administrators and Managers.
          You are currently logged in with the <strong>{user.role}</strong> role.
        </p>
        <button
          type="button"
          onClick={() => navigateTo('cards')}
          className="btn-primary"
          style={{ borderRadius: '10px', padding: '10px 24px' }}
        >
          Return to Cards Inventory
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Top Header */}
      {isMobile && (
        <MobileHeader
          type="detail"
          title="Create Cards (Admin)"
          showBack
          onBack={goBack}
          showNotification
        />
      )}

      {/* Main Container */}
      <div style={{ padding: isMobile ? '16px' : '32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Top Header Row (Hidden during print) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#0B63E5',
                  letterSpacing: '0.4px',
                }}
              >
                Admin Exclusive
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                Modexa Hardware Production Engine
              </span>
            </div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Create Cards & Dynamic QR Generator
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px', maxWidth: '720px', lineHeight: 1.5 }}>
              Generate sequential dynamic QR codes and printable hardware cards for physical printing vendors. Each card is assigned a unique sequential ID that can be dynamically linked or re-routed anytime.
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigateTo('cards')}
              className="btn-secondary"
              style={{ borderRadius: '10px', fontSize: '13px', padding: '9px 16px' }}
            >
              <span>View Inventory ({cards.length})</span>
            </button>
            {generatedBatch.length > 0 && (
              <>
                {/* 1. Export in ZIP (HD PNGs) */}
                <button
                  type="button"
                  onClick={handleExportQRZip}
                  disabled={isExportingZip}
                  className="btn-primary"
                  style={{
                    borderRadius: '10px',
                    fontSize: '13px',
                    padding: '9px 16px',
                    backgroundColor: '#2563EB',
                    cursor: isExportingZip ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Download all cards as 1080x1080 HD PNG images in a ZIP"
                >
                  {isExportingZip ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Exporting ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Archive size={15} />
                      <span>Export in ZIP (HD PNGs)</span>
                    </>
                  )}
                </button>

                {/* 2. Export in PDF (1 QR / Page) */}
                <button
                  type="button"
                  onClick={handleExportQRPDF}
                  disabled={isExportingPDF}
                  className="btn-primary"
                  style={{
                    borderRadius: '10px',
                    fontSize: '13px',
                    padding: '9px 16px',
                    backgroundColor: '#059669',
                    cursor: isExportingPDF ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Download multi-page PDF formatted 1 QR per page"
                >
                  {isExportingPDF ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Exporting PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={15} />
                      <span>Export in PDF ({generatedBatch.length} Pages)</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation (Hidden during print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '24px',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'bulk' ? '#0B63E5' : 'transparent',
              color: activeTab === 'bulk' ? '#FFFFFF' : '#64748B',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={17} />
            <span>Bulk Order Generator</span>
            {generatedBatch.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'bulk' ? '#FFFFFF' : '#EFF6FF',
                  color: activeTab === 'bulk' ? '#0B63E5' : '#0B63E5',
                  fontWeight: 700,
                }}
              >
                {generatedBatch.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('single')}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'single' ? '#0B63E5' : 'transparent',
              color: activeTab === 'single' ? '#FFFFFF' : '#64748B',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <QrCode size={17} />
            <span>Single Card Creator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (generatedBatch.length === 0) {
                showToast('Generate a batch first to view printable sheets.', 'info');
              }
              setActiveTab('print-sheet');
            }}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'print-sheet' ? '#0B63E5' : 'transparent',
              color: activeTab === 'print-sheet' ? '#FFFFFF' : '#64748B',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Printer size={17} />
            <span>Print Sheet & PDF</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: BULK GENERATOR (PRINTING VENDOR ORDER)
            ======================================================== */}
        {activeTab === 'bulk' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Split Layout: Configuration Form on Left, Live Starting Tap Card on Right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(340px, 380px)',
                gap: '24px',
                alignItems: 'start',
              }}
            >
              {/* Generator Form Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: isMobile ? '18px' : '28px',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Batch Configuration for Printing Vendor
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                      Configure sequential numbering, quantity, and print styles for your hardware batch.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <Sparkles size={15} style={{ color: '#0B63E5' }} />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                      Starting Batch ID: {startCardIdPreview}
                    </span>
                  </div>
                </div>

                {/* Grid of Inputs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px',
                    marginBottom: '22px',
                  }}
                >
                  {/* Quantity */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Quantity to Generate
                    </label>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      {[10, 25, 50, 100].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setQuantity(qty)}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '8px',
                            border: quantity === qty ? '1.5px solid #0B63E5' : '1px solid #E2E8F0',
                            backgroundColor: quantity === qty ? '#EFF6FF' : '#FFFFFF',
                            color: quantity === qty ? '#0B63E5' : '#475569',
                            fontWeight: 600,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                          }}
                        >
                          {qty}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* ID Prefix */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Card ID Prefix
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                      placeholder="CRD-"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                      E.g. CRD-, MOD-, TC-
                    </span>
                  </div>

                  {/* Starting Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Starting Number
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={startNumber}
                      onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                      Starts at 1 (0001) by default
                    </span>
                  </div>

                  {/* Number of Digits Padding */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Zero Padding Length
                    </label>
                    <select
                      value={paddingDigits}
                      onChange={(e) => setPaddingDigits(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 500,
                      }}
                    >
                      <option value={3}>3 Digits (e.g. CRD-001)</option>
                      <option value={4}>4 Digits (e.g. CRD-0001)</option>
                      <option value={5}>5 Digits (e.g. CRD-00001)</option>
                      <option value={6}>6 Digits (e.g. CRD-000001)</option>
                    </select>
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                      Fixed width for barcode / OCR scanner
                    </span>
                  </div>

                  {/* Card Print Style Template */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Card Print Style
                    </label>
                    <select
                      value={cardStyle}
                      onChange={(e) => setCardStyle(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 500,
                      }}
                    >
                      <option value="midnight">Midnight Matte Black (Gold NFC Waves)</option>
                      <option value="white">Pure Clinic White (Modexa Blue)</option>
                      <option value="standee">Google Review Acrylic Standee</option>
                    </select>
                  </div>

                  {/* Initial Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Initial Inventory Status
                    </label>
                    <select
                      value={initialStatus}
                      onChange={(e) => setInitialStatus(e.target.value as CardStatus)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 500,
                      }}
                    >
                      <option value="Unassigned">Unassigned (Blank Physical Stock)</option>
                      <option value="Inactive">Inactive (Reserved for Client)</option>
                      <option value="Active">Active (Immediately Live)</option>
                    </select>
                  </div>
                </div>

                {/* Order Reference Note */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Vendor Order Note / Batch Reference
                  </label>
                  <input
                    type="text"
                    value={batchNote}
                    onChange={(e) => setBatchNote(e.target.value)}
                    placeholder="e.g. Vendor PO #2026-OCT - Delhi Clinic NFC Cards"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Range Preview Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '12px',
                    border: '1px solid #BBF7D0',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#166534' }}>
                        Range: {startCardIdPreview} ➔ {endCardIdPreview} ({quantity} Total Cards)
                      </div>
                      <div style={{ fontSize: '12px', color: '#15803D', marginTop: '2px' }}>
                        Dynamic routing URL: <code style={{ fontWeight: 600 }}>https://modexacards.web.app/r/&#123;ID&#125;</code> (each card encoded individually)
                      </div>
                    </div>
                  </div>

                  {/* Primary Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateBulk}
                    disabled={isGenerating}
                    className="btn-primary"
                    style={{
                      borderRadius: '10px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: 700,
                      backgroundColor: '#0B63E5',
                      cursor: isGenerating ? 'wait' : 'pointer',
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        <span>Generating QR Matrix ({quantity})...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} />
                        <span>Generate {quantity} Dynamic QR Cards</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Starting Tap Card Preview (Visualizes the initial card #1) */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: isMobile ? '18px' : '24px',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: isMobile ? 'static' : 'sticky',
                  top: '20px',
                }}
              >
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Starting Tap Card
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#EFF6FF',
                        color: '#0B63E5',
                        fontFamily: 'monospace',
                      }}
                    >
                      #1: {startCardIdPreview}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    First card of your batch. Updates in real-time as you adjust settings.
                  </p>
                </div>

                {/* The Flat Physical Acrylic Stand Preview */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <GoogleReviewAcrylicStand
                    qrDataUrl={startCardQrUrl}
                    cardId={startCardIdPreview}
                    businessName={initialStatus === 'Active' ? 'Pending Activation' : 'Unassigned Stock'}
                    size={300}
                  />
                </div>

                {/* Hardware Spec Quick Notes */}
                <div
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '11.5px',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>First Card ID:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{startCardIdPreview}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Batch Range:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{startCardIdPreview} ➔ {endCardIdPreview}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>NFC Payload:</span>
                    <strong style={{ color: '#0B63E5', wordBreak: 'break-all' }}>https://modexacards.web.app/r/{startCardIdPreview}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Batch Preview Grid & Actions */}
            {generatedBatch.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: isMobile ? '18px' : '28px',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                {/* Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #F1F5F9',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Generated Batch Matrix ({generatedBatch.length} Cards)
                      </h3>
                      {isSavedToInventory ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                          }}
                        >
                          <CheckCircle2 size={13} />
                          Saved to System Inventory
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                          }}
                        >
                          Ready to Commit
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                      Sequential cards from <strong>{generatedBatch[0].id}</strong> to <strong>{generatedBatch[generatedBatch.length - 1].id}</strong> with unique high-resolution QR codes.
                    </p>
                  </div>

                  {/* Actions for Vendor Export */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleDownloadVendorCSV}
                      className="btn-secondary"
                      style={{ borderRadius: '10px', fontSize: '13px', padding: '9px 16px' }}
                    >
                      <FileSpreadsheet size={15} style={{ color: '#059669' }} />
                      <span>Download Vendor CSV</span>
                    </button>

                    {/* Option 1: Export in ZIP (HD PNGs) */}
                    <button
                      type="button"
                      onClick={handleExportQRZip}
                      disabled={isExportingZip}
                      className="btn-primary"
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        padding: '9px 18px',
                        backgroundColor: '#2563EB',
                        cursor: isExportingZip ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      }}
                      title="Download each card as 1080x1080 HD PNG file inside a ZIP archive"
                    >
                      {isExportingZip ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Generating ZIP...</span>
                        </>
                      ) : (
                        <>
                          <Archive size={15} />
                          <span>Export in ZIP (HD PNGs)</span>
                        </>
                      )}
                    </button>

                    {/* Option 2: Export in PDF (1 QR / Page) */}
                    <button
                      type="button"
                      onClick={handleExportQRPDF}
                      disabled={isExportingPDF}
                      className="btn-primary"
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        padding: '9px 18px',
                        backgroundColor: '#059669',
                        cursor: isExportingPDF ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                      }}
                      title="Download clean square PDF with 1 QR per page"
                    >
                      {isExportingPDF ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Exporting {generatedBatch.length}-Page PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileText size={15} />
                          <span>Export in PDF (1 QR / Page)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintToPDF}
                      className="btn-secondary"
                      style={{ borderRadius: '10px', fontSize: '13px', padding: '9px 16px' }}
                    >
                      <Printer size={15} />
                      <span>Print Sheet (1 QR / Page)</span>
                    </button>

                    {!isSavedToInventory ? (
                      <button
                        type="button"
                        onClick={handleSaveBatchToInventory}
                        className="btn-primary"
                        style={{
                          borderRadius: '10px',
                          fontSize: '13px',
                          padding: '9px 18px',
                          backgroundColor: '#0B63E5',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Add these cards to Inventory</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigateTo('cards')}
                        className="btn-primary"
                        style={{
                          borderRadius: '10px',
                          fontSize: '13px',
                          padding: '9px 18px',
                          backgroundColor: '#10B981',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>View in Cards Inventory ➔</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Batch Preview Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    Showing <strong>{Math.min(10, generatedBatch.length)}</strong> sample QR codes preview {generatedBatch.length > 10 ? `(1 to 10 of ${generatedBatch.length} total generated)` : ''}
                  </div>
                  {generatedBatch.length > 10 && (
                    <span style={{ fontSize: '12px', color: '#0B63E5', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>
                      All {generatedBatch.length} QR codes will be exported in the PDF
                    </span>
                  )}
                </div>

                {/* Batch Cards Grid - PURE SQUARE QR CODES ONLY (First 10) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? 'repeat(2, 1fr)'
                      : 'repeat(5, 1fr)',
                    gap: '16px',
                    padding: '4px',
                  }}
                >
                  {generatedBatch.slice(0, 10).map((card) => (
                    <div
                      key={card.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1.5px solid #E2E8F0',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        aspectRatio: '1 / 1',
                        overflow: 'hidden',
                      }}
                    >
                      {/* ONLY THE QR CODE */}
                      <img
                        src={card.qrDataUrl}
                        alt="QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />

                      {/* Quick Single QR Download */}
                      <a
                        href={card.qrDataUrl}
                        download={`${card.id}_QR.png`}
                        title="Download QR Image"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.92)',
                          border: '1px solid #CBD5E1',
                          color: '#0B63E5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                          textDecoration: 'none',
                        }}
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: SINGLE CARD CREATOR
            ======================================================== */}
        {activeTab === 'single' && (
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '24px' }}>
            {/* Left: Input Form */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: isMobile ? '18px' : '28px',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Single Hardware Card Creator
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                Create a customized single card with dynamic QR code, instant preview, and direct assignment.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Card ID */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Card ID (Unique Hardware Identifier)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={singleId}
                      onChange={(e) => setSingleId(e.target.value.toUpperCase())}
                      placeholder="CRD-0001"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleNextSingleId}
                      title="Auto Next ID"
                      className="btn-secondary"
                      style={{ borderRadius: '10px', padding: '0 14px', fontSize: '12px' }}
                    >
                      <RefreshCw size={14} />
                      <span>Next ID</span>
                    </button>
                  </div>
                </div>

                {/* Business Assignment (Optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assign Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={singleBusinessName}
                    onChange={(e) => setSingleBusinessName(e.target.value)}
                    placeholder="e.g. Apex Multispecialty Dental Care (or leave blank for stock)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                    Leave blank to keep as unassigned physical stock for future clients.
                  </span>
                </div>

                {/* Business Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Industry / Category
                  </label>
                  <select
                    value={singleCategory}
                    onChange={(e) => setSingleCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Card Template Design */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Card Material & Visual Template
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'midnight', label: 'Midnight Black', desc: 'Matte dark PVC' },
                      { id: 'white', label: 'Pure White', desc: 'Gloss clinic card' },
                      { id: 'standee', label: 'Counter Standee', desc: 'Acrylic desk stand' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSingleStyle(st.id as any)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: singleStyle === st.id ? '2px solid #0B63E5' : '1px solid #E2E8F0',
                          backgroundColor: singleStyle === st.id ? '#EFF6FF' : '#FFFFFF',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: singleStyle === st.id ? '#0B63E5' : '#0F172A' }}>
                          {st.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {st.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Card Inventory Status
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['Unassigned', 'Active', 'Inactive'] as CardStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSingleStatus(st)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: singleStatus === st ? '1.5px solid #0B63E5' : '1px solid #E2E8F0',
                          backgroundColor: singleStatus === st ? '#EFF6FF' : '#FFFFFF',
                          color: singleStatus === st ? '#0B63E5' : '#475569',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic URL Preview */}
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                    DYNAMIC ROUTING URL (SCANNED DESTINATION):
                  </div>
                  <div style={{ fontSize: '12.5px', fontFamily: 'monospace', color: '#0B63E5', wordBreak: 'break-all', fontWeight: 600 }}>
                    {buildDynamicUrl(singleId)}
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSaveSingleCard}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700 }}
                  >
                    <Plus size={16} />
                    <span>Save Card to Inventory</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSingleQR}
                    className="btn-secondary"
                    style={{ borderRadius: '10px', padding: '12px 18px', fontSize: '13.5px' }}
                  >
                    <Download size={16} />
                    <span>Download QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Card Mockup matching User Attached Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: isMobile ? '16px' : '22px',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Live Physical Acrylic Stand Mockup
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                      Exact Google Review Standee • Interactive 3D Perspective
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                    }}
                  >
                    Exact Production SVG
                  </span>
                </div>

                <GoogleReviewAcrylicStand
                  qrDataUrl={singleQrDataUrl}
                  cardId={singleId}
                  businessName={singleBusinessName}
                  poweredByText="Powered by Modexa TapCard"
                  size={isMobile ? 310 : 380}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: PRINT SHEET & PDF EXPORT (1 QR PER PAGE)
            ======================================================== */}
        {activeTab === 'print-sheet' && (
          <div>
            {/* Control Bar for Print (Hidden on paper print) */}
            <div
              className="no-print"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  A4 Print Sheet — 1 QR Code Per Page
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                  Each QR code is isolated on its own page ({generatedBatch.length} total pages in PDF/Print).
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showCutMarks}
                    onChange={(e) => setShowCutMarks(e.target.checked)}
                  />
                  <span>Show Crop Guide Frame</span>
                </label>

                {/* Option 1: Export in ZIP */}
                <button
                  type="button"
                  onClick={handleExportQRZip}
                  disabled={isExportingZip}
                  className="btn-primary"
                  style={{
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '13.5px',
                    backgroundColor: '#2563EB',
                    cursor: isExportingZip ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  {isExportingZip ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Packing ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Archive size={16} />
                      <span>Export in ZIP (HD PNGs)</span>
                    </>
                  )}
                </button>

                {/* Option 2: Export in PDF */}
                <button
                  type="button"
                  onClick={handleExportQRPDF}
                  disabled={isExportingPDF}
                  className="btn-primary"
                  style={{
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '13.5px',
                    backgroundColor: '#059669',
                    cursor: isExportingPDF ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  {isExportingPDF ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      <span>Export in PDF ({generatedBatch.length} Pages)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintToPDF}
                  className="btn-secondary"
                  style={{ borderRadius: '10px', padding: '10px 20px', fontSize: '13.5px' }}
                >
                  <Printer size={16} />
                  <span>Print / Save as PDF (Ctrl + P)</span>
                </button>
              </div>
            </div>

            {/* Empty state if no batch generated */}
            {generatedBatch.length === 0 ? (
              <div
                className="no-print"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '60px 24px',
                  textAlign: 'center',
                }}
              >
                <Layers size={40} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  No Batch Generated Yet
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '400px', margin: '0 auto 18px' }}>
                  Please go to the <strong>Bulk Order Generator</strong> tab and generate a batch of cards first.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('bulk')}
                  className="btn-primary"
                  style={{ borderRadius: '10px', padding: '10px 20px' }}
                >
                  Go to Bulk Generator
                </button>
              </div>
            ) : (
              /* Printable Sheet Content (Visible on screen and during paper print - 1 QR Per Page) */
              <div
                ref={printAreaRef}
                className="printable-batch-sheet"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                {/* Notice banner for browser view */}
                <div
                  className="no-print"
                  style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: '12px',
                    border: '1px solid #BFDBFE',
                    padding: '14px 18px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#1E40AF' }}>
                    <strong>1 QR Per Page Production Format:</strong> Scrolling below shows each card page with only its high-resolution dynamic QR code, unique hardware ID, and URL. Total {generatedBatch.length} pages.
                  </div>
                  <button
                    type="button"
                    onClick={handleExportQRPDF}
                    disabled={isExportingPDF}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#0B63E5',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Direct PDF Export
                  </button>
                </div>

                {/* 1 QR Code Per Page List */}
                {generatedBatch.map((card, idx) => (
                  <div
                    key={card.id}
                    className="print-single-qr-page"
                    style={{
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '80vh',
                      padding: '40px 20px',
                      borderBottom: idx < generatedBatch.length - 1 ? '2px dashed #E2E8F0' : 'none',
                      boxSizing: 'border-box',
                      pageBreakAfter: 'always',
                      breakAfter: 'page',
                    }}
                  >
                    <div
                      style={{
                        width: '340px',
                        height: '340px',
                        border: showCutMarks ? '1.5px dashed #94A3B8' : 'none',
                        borderRadius: '16px',
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* Cut corner crop marks */}
                      {showCutMarks && (
                        <>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', borderTop: '2.5px solid #000', borderLeft: '2.5px solid #000' }} />
                          <div style={{ position: 'absolute', top: 0, right: 0, width: '14px', height: '14px', borderTop: '2.5px solid #000', borderRight: '2.5px solid #000' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '14px', height: '14px', borderBottom: '2.5px solid #000', borderLeft: '2.5px solid #000' }} />
                          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', borderBottom: '2.5px solid #000', borderRight: '2.5px solid #000' }} />
                        </>
                      )}

                      {/* ONLY THE PURE QR CODE */}
                      <img
                        src={card.qrDataUrl}
                        alt="QR Code"
                        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
