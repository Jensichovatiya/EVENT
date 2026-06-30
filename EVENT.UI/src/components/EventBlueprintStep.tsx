import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Divider, Alert, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import BlueprintDesigner from './BlueprintDesigner';
import ZoneDesigner from './ZoneDesigner';
import SeatGrid from './SeatGrid';
import EntryGateForm from './EntryGateForm';
import ZonePricing from './ZonePricing';
import AppUpload from './AppUpload';
import AppLoader from './AppLoader';
import { blueprintApi } from '../api/blueprintApi';
import { commonApi } from '../api/commonApi';

interface EventBlueprintStepProps {
  eventId: number;
  onNext: () => void;
  onBack: () => void;
  slots: { label: string; value: number }[];
}

export const EventBlueprintStep: React.FC<EventBlueprintStepProps> = ({
  eventId,
  onNext,
  onBack,
  slots
}) => {
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);

  // Lists
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [gates, setGates] = useState<any[]>([]);
  const [pricings, setPricings] = useState<any[]>([]);

  // Dynamic dropdown options
  const [dropdowns, setDropdowns] = useState<any>({
    zoneTypes: [],
    gateTypes: [],
    entryGates: []
  });

  // Forms
  const zoneForm = useForm();

  // Load existing blueprint, gates, zones and pricing for event
  useEffect(() => {
    if (eventId > 0) {
      const loadBlueprintData = async () => {
        setLoading(true);
        try {
          // Fetch dynamic dropdowns
          const dropRes = await commonApi.getEventDropdowns(eventId);
          if (dropRes.success && dropRes.data) {
            setDropdowns({
              zoneTypes: dropRes.data.zoneTypes || [],
              gateTypes: dropRes.data.gateTypes || [],
              entryGates: dropRes.data.entryGates || []
            });
          }

          // Blueprints
          const bpRes = await blueprintApi.getBlueprintsByEvent(eventId);
          if (bpRes.success && bpRes.data && bpRes.data.length > 0) {
            const bp = bpRes.data[0];
            setBlueprint(bp);

            // Zones
            const zoneRes = await blueprintApi.getZonesByBlueprint(bp.blueprintId);
            if (zoneRes.success && zoneRes.data) {
              let savedPositions: any[] = [];
              try {
                if (bp.blueprintJson) {
                  savedPositions = JSON.parse(bp.blueprintJson);
                }
              } catch (e) {
                console.error("Failed to parse blueprintJson", e);
              }

              const mappedZones = zoneRes.data.map(z => {
                const pos = savedPositions.find(p => p.zoneId === z.zoneId || p.name === z.zoneName || p.zoneCode === z.zoneCode);
                return {
                  id: z.zoneId.toString(),
                  name: z.zoneName,
                  type: z.zoneType,
                  x: pos ? pos.x : 50 + (Math.random() * 200),
                  y: pos ? pos.y : 50 + (Math.random() * 100),
                  width: pos ? pos.width : 120,
                  height: pos ? pos.height : 70,
                  color: z.colorCode || '#10b981',
                  shape: pos ? pos.shape : 'rect',
                  ...z
                };
              });
              setZones(mappedZones);
            }
          }

          // Gates
          const gatesRes = await blueprintApi.getEntryGatesByEvent(eventId);
          if (gatesRes.success && gatesRes.data) {
            setGates(gatesRes.data);
          }

          // Pricing
          const pricingRes = await blueprintApi.getZonePricingByEvent(eventId);
          if (pricingRes.success && pricingRes.data) {
            setPricings(pricingRes.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadBlueprintData();
    }
  }, [eventId]);

  const handleSelectZone = async (zone: any) => {
    setSelectedZone(zone);
    zoneForm.reset({
      zoneName: zone.name,
      zoneCode: zone.zoneCode || zone.name.substring(0, 3).toUpperCase(),
      zoneType: zone.type || 'General',
      colorCode: zone.color,
      capacity: zone.capacity || 100,
      rowCount: zone.rowCount || 5,
      columnCount: zone.columnCount || 10,
      seatPrice: zone.seatPrice || 0,
      isVIP: !!zone.isVIP,
      isReserved: !!zone.isReserved,
      isSeatSelectionAllowed: zone.isSeatSelectionAllowed !== false,
      entryGateId: zone.entryGateId || '',
      remarks: zone.remarks || ''
    });

    // Load seats
    if (zone.zoneRId || zone.zoneId > 0) {
      try {
        const res = await blueprintApi.getSeatsByZone(zone.zoneId, eventId);
        if (res.success && res.data) {
          setSeats(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSeats([]);
    }
  };

  const handleAddZone = (shape: 'rect' | 'circle') => {
    const newId = `temp_${Date.now()}`;
    const newZone = {
      id: newId,
      zoneId: 0,
      name: `Zone ${zones.length + 1}`,
      type: 'General',
      x: 100 + (zones.length * 30),
      y: 120,
      width: 120,
      height: 70,
      color: '#10b981',
      shape,
      capacity: 50,
      rowCount: 5,
      columnCount: 10,
      seatPrice: 500,
      isVIP: false,
      isReserved: false,
      isSeatSelectionAllowed: true
    };
    setZones([...zones, newZone]);
    handleSelectZone(newZone);
  };

  const handleSaveZoneProperties = async (data: any) => {
    if (!selectedZone) return;

    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = userObj?.email || userObj?.userName || 'system';

      // Ensure blueprint exists first
      let activeBpId = blueprint?.blueprintId || 0;
      if (activeBpId === 0) {
        const bpPayload = {
          blueprintId: 0,
          eventId: eventId,
          blueprintName: 'Default Event Blueprint',
          blueprintImage: '',
          blueprintJson: JSON.stringify(zones),
          stagePosition: 'Top',
          totalZones: zones.length,
          totalSeats: zones.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0),
          isSeatBased: true,
          isPublished: true,
          createdBy: 1,
          createdFrom: 'WebUI'
        };
        const bpRes = await blueprintApi.addEditBlueprint(bpPayload);
        if (bpRes.success && bpRes.data) {
          activeBpId = Number(bpRes.data);
          setBlueprint({ ...bpPayload, blueprintId: activeBpId });
        } else {
          toast.error('Failed to create event blueprint.');
          return;
        }
      }

      const zonePayload = {
        zoneId: selectedZone.zoneId || 0,
        blueprintId: activeBpId,
        eventId: eventId,
        zoneName: data.zoneName,
        zoneCode: data.zoneCode,
        zoneType: data.zoneType,
        colorCode: data.colorCode,
        capacity: Number(data.capacity) || 0,
        rowCount: Number(data.rowCount) || 0,
        columnCount: Number(data.columnCount) || 0,
        seatPrice: Number(data.seatPrice) || 0,
        isVIP: !!data.isVIP,
        isReserved: !!data.isReserved,
        isSeatSelectionAllowed: !!data.isSeatSelectionAllowed,
        entryGateId: data.entryGateId ? Number(data.entryGateId) : null,
        sortOrder: 0,
        remarks: data.remarks || '',
        isActive: true,
        createdBy: 1,
        createdFrom: 'WebUI'
      };

      const res = await blueprintApi.addEditZone(zonePayload);
      if (res.success && res.data) {
        const savedId = Number(res.data);
        toast.success(res.message || 'Zone properties saved.');

        // Update local zone state
        const updatedZones = zones.map(z => z.id === selectedZone.id ? {
          ...z,
          ...zonePayload,
          zoneId: savedId,
          name: data.zoneName,
          type: data.zoneType,
          color: data.colorCode,
          rowCount: Number(data.rowCount),
          columnCount: Number(data.columnCount)
        } : z);
        setZones(updatedZones);
        setSelectedZone(updatedZones.find(z => z.id === selectedZone.id));
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving zone.');
    }
  };

  const handleAutoGenerateSeats = async () => {
    if (!selectedZone || (!selectedZone.zoneRId && selectedZone.zoneId === 0)) {
      toast.error('Please save the Zone properties first.');
      return;
    }

    const rows = Number(zoneForm.watch('rowCount')) || 0;
    const cols = Number(zoneForm.watch('columnCount')) || 0;

    const list: any[] = [];
    for (let r = 0; r < rows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      for (let c = 1; c <= cols; c++) {
        list.push({
          seatId: 0,
          seatRId: '',
          zoneId: selectedZone.zoneId,
          eventId: eventId,
          seatNumber: `${rowLetter}${c}`,
          rowName: rowLetter,
          columnNo: c,
          seatStatus: 'Available',
          isBooked: false,
          isBlocked: false,
          isReserved: false,
          price: selectedZone.seatPrice || 0,
          createdBy: 1
        });
      }
    }

    try {
      const res = await blueprintApi.saveZoneSeats(list);
      if (res.success) {
        toast.success('Seats generated and saved successfully.');
        setSeats(list);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save seats.');
    }
  };

  const handleToggleSeatStatus = async (seatNo: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Available' ? 'Blocked' : currentStatus === 'Blocked' ? 'Reserved' : 'Available';
    const updated = seats.map(s => s.seatNumber === seatNo ? {
      ...s,
      seatStatus: nextStatus,
      isBlocked: nextStatus === 'Blocked',
      isReserved: nextStatus === 'Reserved'
    } : s);

    try {
      const res = await blueprintApi.saveZoneSeats(updated);
      if (res.success) {
        setSeats(updated);
        toast.success(`Seat ${seatNo} updated to ${nextStatus}.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update seat.');
    }
  };

  const handleAddGate = async (gate: any) => {
    try {
      const payload = { ...gate, eventId };
      const res = await blueprintApi.addEditEntryGate(payload);
      if (res.success) {
        toast.success('Gate saved.');
        setGates([...gates, { ...payload, entryGateId: Number(res.data) }]);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddPricing = async (pricing: any) => {
    try {
      const payload = { ...pricing, eventId };
      const res = await blueprintApi.addEditZonePricing(payload);
      if (res.success) {
        toast.success('Pricing saved.');
        setPricings([...pricings, { ...payload, zonePricingId: Number(res.data) }]);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateZonePosition = (zoneId: string, x: number, y: number) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, x, y } : z));
  };

  const handleSaveBlueprint = async () => {
    try {
      let activeBpId = blueprint?.blueprintId || 0;
      const bpPayload = {
        blueprintId: activeBpId,
        eventId: eventId,
        blueprintName: blueprint?.blueprintName || 'Default Event Blueprint',
        blueprintImage: blueprint?.blueprintImage || '',
        blueprintJson: JSON.stringify(zones.map(z => ({
          zoneId: z.zoneId,
          name: z.name,
          zoneCode: z.zoneCode,
          x: z.x,
          y: z.y,
          width: z.width,
          height: z.height,
          shape: z.shape,
          color: z.color
        }))),
        stagePosition: blueprint?.stagePosition || 'Top',
        totalZones: zones.length,
        totalSeats: zones.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0),
        isSeatBased: true,
        isPublished: true,
        createdBy: 1,
        createdFrom: 'WebUI'
      };
      const bpRes = await blueprintApi.addEditBlueprint(bpPayload);
      if (bpRes.success && bpRes.data) {
        const savedId = Number(bpRes.data);
        setBlueprint({ ...bpPayload, blueprintId: savedId });
        toast.success("Blueprint layout saved successfully.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to save blueprint layout.");
    }
  };

  const handleNextStep = async () => {
    await handleSaveBlueprint();
    onNext();
  };

  if (loading) return <AppLoader message="Loading blueprint designer..." />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Blueprint & Seating Arrangement</Typography>
      <Alert severity="info">
        Define stage, draw zones, auto-generate seat grids, assign gates, and configure ticket prices step-by-step.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 3.5 }}>

        {/* Left Side: Designer Canvas */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <BlueprintDesigner
            blueprintImage={blueprint?.blueprintImage || ''}
            stagePosition={blueprint?.stagePosition || 'Top'}
            setStagePosition={(pos) => setBlueprint((prev: any) => ({ ...prev, stagePosition: pos }))}
            zones={zones}
            onAddZone={handleAddZone}
            onSelectZone={handleSelectZone}
            onUpdateZonePosition={handleUpdateZonePosition}
            onSaveLayout={handleSaveBlueprint}
          />

          {selectedZone && (
            <SeatGrid
              rowCount={Number(zoneForm.watch('rowCount')) || 0}
              columnCount={Number(zoneForm.watch('columnCount')) || 0}
              seats={seats}
              onToggleSeatStatus={handleToggleSeatStatus}
              onAutoGenerate={handleAutoGenerateSeats}
            />
          )}
        </Box>

        {/* Right Side: Setup properties */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {selectedZone ? (
            <form onSubmit={zoneForm.handleSubmit(handleSaveZoneProperties)}>
              <ZoneDesigner
                register={zoneForm.register}
                watch={zoneForm.watch}
                setValue={zoneForm.setValue}
                gates={gates.map((g: any) => ({ label: g.gateName, value: g.entryGateId }))}
                zoneTypes={dropdowns.zoneTypes}
                errors={zoneForm.formState.errors}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" style={{ textTransform: 'none', borderRadius: 8 }}>
                  Save Zone Details
                </Button>
              </Box>
            </form>
          ) : (
            <Card variant="outlined" style={{ borderRadius: 12 }}>
              <CardContent sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Select a zone on the blueprint or click "Add Zone" to begin configuration.
                </Typography>
              </CardContent>
            </Card>
          )}

          <EntryGateForm
            gates={gates}
            gateTypes={dropdowns.gateTypes}
            onAddGate={handleAddGate}
            onRemoveGate={(idx) => setGates(gates.filter((_, i) => i !== idx))}
          />

          <ZonePricing
            pricings={pricings}
            zones={zones.map(z => ({ label: z.name, value: z.zoneId }))}
            slots={slots}
            onAddPricing={handleAddPricing}
            onRemovePricing={(idx) => setPricings(pricings.filter((_, i) => i !== idx))}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Back to Slots
        </Button>
        <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNextStep} sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}>
          Next: Review & Publish
        </Button>
      </Box>
    </Box>
  );
};

export default EventBlueprintStep;
