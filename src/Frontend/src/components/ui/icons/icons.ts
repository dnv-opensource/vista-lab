import { library } from '@fortawesome/fontawesome-svg-core';
import {
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
  faTag,
  faMicrochip,
  faTimes,
  faSpinner,
  faCaretUp,
  faCaretDown,
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
  faTag,
  faMicrochip,
  faTimes,
  faSpinner,
  faCaretUp,
  faCaretDown
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
  Tag = 'tag',
  Microchip = 'microchip',
  Times = 'times',
  Spinner = 'spinner',
  CaretUp = 'caret-up',
  CaretDown = 'caret-down',
}

export enum IconVariant {
  Solid = 'solid',
}
