import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faArrowRight,
  faBars,
  faCaretDown,
  faCaretUp,
  faCrosshairs,
  faExpand,
  faExpandAlt,
  faFilter,
  faHashtag,
  faMagnifyingGlass,
  faMapMarker,
  faMicrochip,
  faRss,
  fas,
  faShip,
  faSpinner,
  faStream,
  faTag,
  faTimes,
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
  faCrosshairs
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
}

export enum IconVariant {
  Solid = 'solid',
}
