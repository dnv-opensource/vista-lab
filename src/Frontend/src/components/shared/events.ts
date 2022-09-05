import { EventAction } from "use-bus";

export enum BusEvents {
    TreeAllNodesStatus = '@tree/AllNodesStatus',
    TreeAllDataChannelsStatus = '@tree/AllDataChannelsStatus',
}

export type TreeAllNodesStatus = 'expanded' | 'collapsed' | null;
export type TreeAllNodesStatusEvent = { action: TreeAllNodesStatus } & EventAction;

export type TreeAllDataChannelsStatus = 'expanded' | 'collapsed' | null;
export type TreeAllDataChannelsStatusEvent = { action: TreeAllDataChannelsStatus } & EventAction;
