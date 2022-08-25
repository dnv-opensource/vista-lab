import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleDown,
  faAngleRight,
  faArrowLeft,
  faArrowRight,
  faBars,
  faCaretDown,
  faCaretUp,
  faChartColumn,
  faCrosshairs,
  faExpand,
  faExpandAlt,
  faEye,
  faFilter,
  faHashtag,
  faLink,
  faMagnifyingGlass,
  faMap,
  faMapMarker,
  faMicrochip,
  faMinus,
  faPlus,
  faRss,
  fas,
  faShip,
  faSpinner,
  faStream,
  faTag,
  faTimes,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  fas,
  faRss,
  faShip,
  faFilter,
  faMagnifyingGlass,
  faHashtag,
  faExpand,
  faMapMarker,
  faExpandAlt,
  faArrowLeft,
  faArrowRight,
  faTag,
  faMicrochip,
  faTimes,
  faSpinner,
  faCaretUp,
  faCaretDown,
  faBars,
  faStream,
  faMicrochip,
  faCrosshairs,
  faMap,
  faMinus,
  faPlus,
  faXmark,
  faChartColumn,
  faEye,
  faTrash,
  faLink,
  faAngleDown,
  faAngleRight
);

// Make sure these correspond with FontAwsome v6.1 icon names
export enum IconName {
  RSS = 'rss',
  Ship = 'ship',
  Filter = 'filter',
  Search = 'magnifying-glass',
  Hashtag = 'hashtag',
  Expand = 'expand',
  Marker = 'map-marker-alt',
  LeftArrow = 'long-arrow-alt-left',
  RightDownArrow = 'arrow-right',
  Tag = 'tag',
  Microchip = 'microchip',
  Times = 'times',
  Spinner = 'spinner',
  CaretUp = 'caret-up',
  CaretDown = 'caret-down',
  Bars = 'bars',
  Stream = 'stream',
  Crosshairs = 'crosshairs',
  Map = 'map',
  Minus = 'minus',
  Plus = 'plus',
  XMark = 'xmark',
  ChartColumn = 'chart-column',
  Eye = 'eye',
  Trash = 'trash',
  Link = 'link',
  AngleRight = 'angle-right',
  AngleDown = 'angle-down',
}

export enum IconVariant {
  Solid = 'solid',
}
