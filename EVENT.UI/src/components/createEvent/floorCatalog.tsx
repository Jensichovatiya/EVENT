import React from 'react';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import Crop169Icon from '@mui/icons-material/Crop169';
import WeekendIcon from '@mui/icons-material/Weekend';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WcIcon from '@mui/icons-material/Wc';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import StairsIcon from '@mui/icons-material/Stairs';
import ElevatorIcon from '@mui/icons-material/Elevator';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PowerIcon from '@mui/icons-material/Power';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WindowIcon from '@mui/icons-material/Window';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import RampRightIcon from '@mui/icons-material/RampRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

export type CatalogItem = {
  type: string;
  label: string;
  category: string;
  color: string;
  w: number;     // px (20px = 1m)
  h: number;
  sizeLabel: string;
  Icon: React.ElementType;
};

// 20px === 1 meter for the canvas coordinate system.
export const M = 20;

export const CATEGORIES = [
  'All Components', 'Seating', 'Tables', 'Booths', 'Stages',
  'Amenities', 'Access & Safety', 'Decor & Misc', 'Structures', 'Utility', 'Furniture',
];

export const CATALOG: CatalogItem[] = [
  { type: 'booth', label: 'Booth', category: 'Booths', color: '#C9B9F7', w: 60, h: 60, sizeLabel: '3m x 3m', Icon: CropSquareIcon },
  { type: 'stage', label: 'Stage', category: 'Stages', color: '#C9B9F7', w: 240, h: 120, sizeLabel: '12m x 6m', Icon: Crop169Icon },
  { type: 'lounge', label: 'Lounge', category: 'Decor & Misc', color: '#BFE3C0', w: 80, h: 80, sizeLabel: '4m x 4m', Icon: WeekendIcon },
  { type: 'table_round', label: 'Table (Round)', category: 'Tables', color: '#F7C9A6', w: 30, h: 30, sizeLabel: '1.5m', Icon: RadioButtonUncheckedIcon },
  { type: 'table_square', label: 'Table (Square)', category: 'Tables', color: '#F7C9A6', w: 30, h: 30, sizeLabel: '1.5m x 1.5m', Icon: CheckBoxOutlineBlankIcon },
  { type: 'chair', label: 'Chair', category: 'Seating', color: '#B6C2D9', w: 16, h: 16, sizeLabel: 'Standard', Icon: EventSeatIcon },
  { type: 'registration', label: 'Registration Desk', category: 'Amenities', color: '#F7C9A6', w: 40, h: 20, sizeLabel: '2m x 1m', Icon: AppRegistrationIcon },
  { type: 'infodesk', label: 'Information Desk', category: 'Amenities', color: '#F4D58D', w: 40, h: 20, sizeLabel: '2m x 1m', Icon: InfoOutlinedIcon },
  { type: 'foodcourt', label: 'Food Court', category: 'Amenities', color: '#F7C9A6', w: 60, h: 60, sizeLabel: '3m x 3m', Icon: RestaurantIcon },
  { type: 'restroom', label: 'Restroom', category: 'Amenities', color: '#F2B8C6', w: 60, h: 60, sizeLabel: '3m x 3m', Icon: WcIcon },
  { type: 'entrance', label: 'Entrance', category: 'Access & Safety', color: '#D6D6E7', w: 60, h: 18, sizeLabel: '3m Wide', Icon: LoginIcon },
  { type: 'exit', label: 'Exit', category: 'Access & Safety', color: '#D6D6E7', w: 60, h: 18, sizeLabel: '3m Wide', Icon: LogoutIcon },
  { type: 'emergency', label: 'Emergency Exit', category: 'Access & Safety', color: '#BFE3C0', w: 60, h: 18, sizeLabel: '3m Wide', Icon: DirectionsRunIcon },
  { type: 'wall', label: 'Wall', category: 'Structures', color: '#9CA3AF', w: 160, h: 10, sizeLabel: 'Custom', Icon: ViewAgendaIcon },
  { type: 'door', label: 'Door', category: 'Structures', color: '#B6C2D9', w: 30, h: 12, sizeLabel: 'Single / Double', Icon: MeetingRoomIcon },
  { type: 'column', label: 'Column', category: 'Structures', color: '#B6C2D9', w: 14, h: 14, sizeLabel: '0.6m x 0.6m', Icon: ViewColumnIcon },
  { type: 'stairs', label: 'Stairs', category: 'Structures', color: '#B6C2D9', w: 40, h: 30, sizeLabel: '2m Wide', Icon: StairsIcon },
  { type: 'ramp', label: 'Ramp', category: 'Structures', color: '#B6C2D9', w: 40, h: 30, sizeLabel: '2m Wide', Icon: RampRightIcon },
  { type: 'elevator', label: 'Elevator', category: 'Structures', color: '#B6C2D9', w: 40, h: 40, sizeLabel: '2m x 2m', Icon: ElevatorIcon },
  { type: 'window', label: 'Window', category: 'Structures', color: '#D6D6E7', w: 50, h: 10, sizeLabel: 'Custom', Icon: WindowIcon },
  { type: 'storage', label: 'Storage', category: 'Decor & Misc', color: '#E5D3B3', w: 40, h: 40, sizeLabel: '2m x 2m', Icon: Inventory2Icon },
  { type: 'power', label: 'Power Outlet', category: 'Utility', color: '#F4D58D', w: 16, h: 16, sizeLabel: '0.2m', Icon: PowerIcon },
  { type: 'water', label: 'Water Point', category: 'Utility', color: '#A6D8F7', w: 16, h: 16, sizeLabel: '0.2m', Icon: WaterDropIcon },
  { type: 'wifi', label: 'Wi-Fi Router', category: 'Utility', color: '#C9B9F7', w: 16, h: 16, sizeLabel: '0.2m', Icon: WifiIcon },
  { type: 'fire', label: 'Fire Extinguisher', category: 'Utility', color: '#F2B8C6', w: 16, h: 16, sizeLabel: '0.2m', Icon: LocalFireDepartmentIcon },
  { type: 'trash', label: 'Trash Bin', category: 'Utility', color: '#B6C2D9', w: 16, h: 16, sizeLabel: '0.3m', Icon: DeleteOutlineIcon },
  { type: 'airvent', label: 'Air Vent', category: 'Utility', color: '#D6D6E7', w: 20, h: 20, sizeLabel: '0.5m', Icon: AcUnitIcon },
  { type: 'sofa', label: 'Sofa', category: 'Furniture', color: '#BFE3C0', w: 50, h: 24, sizeLabel: '2.5m x 1m', Icon: WeekendIcon },
  { type: 'counter', label: 'Counter', category: 'Furniture', color: '#F7C9A6', w: 50, h: 20, sizeLabel: '2.5m x 1m', Icon: TableRestaurantIcon },
  { type: 'shelf', label: 'Shelf', category: 'Furniture', color: '#E5D3B3', w: 40, h: 16, sizeLabel: '2m x 0.8m', Icon: Inventory2Icon },
];

export const byType = (type: string): CatalogItem | undefined => CATALOG.find((c) => c.type === type);

export const CompIcon: React.FC<{ type: string; sx?: any }> = ({ type, sx }) => {
  const item = byType(type);
  const Icon = item?.Icon ?? CropSquareIcon;
  return <Icon sx={sx} />;
};
