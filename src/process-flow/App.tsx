import { SmartBezierEdge, SmartStepEdge } from '@tisoap/react-flow-smart-edge';
import { uniqueId } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, BackgroundVariant, Controls, Edge, MiniMap, Node, OnConnect, OnEdgeUpdateFunc, OnNodesDelete, OnSelectionChangeFunc, ReactFlowInstance, addEdge, getConnectedEdges, getIncomers, getOutgoers, updateEdge, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import './App.scss';
import { CustomEdge } from './CustomEdge';
import { CustomEdgeToolbarPlaceholder } from './CustomEdgeToolbar';
import { CustomNode } from './CustomNode';
import { selectedEdgeIdsState, selectedNodeIdsState } from './states';
import { Action, State, Type } from './types';
import { prevent } from './helpers';
import { Button } from '@mui/material';
import { showToast2 } from './MySnackbar';

const WORKFLOW_JSON = { "nodes": [{ "width": 125, "height": 25, "id": "f836a322-ae52-426f-9b16-afe26f498497", "data": { "label": "Migration complete", "type": "DONE", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 1625 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 1625 } }, { "width": 195, "height": 25, "id": "c0043690-e7ca-4416-b6d7-ed8e6993bd1d", "data": { "label": "GoLive test load requested", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 500, "y": 1550 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 500, "y": 1550 } }, { "width": 125, "height": 25, "id": "c9213646-e31a-4a00-a177-df5936641146", "data": { "label": "GoLive", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 1475 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": 100, "y": 1475 } }, { "width": 191, "height": 25, "id": "d1fbb329-ff28-4d00-adc0-eecb704c379a", "data": { "label": "GoLive T-1 letter acknowledged", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 1375 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 1375 } }, { "width": 137, "height": 25, "id": "cb2cd55a-8314-4639-8147-aa504d7e1d25", "data": { "label": "GoLive T-1 letter sent", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 1275 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 1275 } }, { "width": 191, "height": 25, "id": "a8b091e1-daa3-42d0-980b-67b31be59759", "data": { "label": "GoLive T-5 letter acknowledged", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 1175 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": 100, "y": 1175 }, "dragging": false }, { "width": 167, "height": 25, "id": "81b21de4-e3b6-4674-b98b-fa3ba020a5dc", "data": { "label": "GoLive T-5 letter sent", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 1075 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 1075 } }, { "width": 197, "height": 25, "id": "ef5d41a7-bc55-40a3-9872-d316a6c91ac1", "data": { "label": "GoLive T-14 letter acknowledged", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 975 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 975 } }, { "width": 173, "height": 25, "id": "147325e2-0079-47f6-899a-f41a16ee2617", "data": { "label": "GoLive T-14 letter sent", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 875 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 875 } }, { "width": 220, "height": 25, "id": "31a5eb64-654b-4566-a2b0-39fa04da57be", "data": { "label": "Additional connection info requested", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": -300, "y": 612.5 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": -300, "y": 612.5 }, "dragging": false }, { "width": 191, "height": 25, "id": "09dbcd98-8e14-421f-b5bb-06ceb5671e5d", "data": { "label": "Connection test date confirmed", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 487.5, "y": 831.25 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": 487.5, "y": 831.25 }, "dragging": false }, { "width": 219, "height": 25, "id": "492b9012-1022-4e32-a2a8-15e97ec784ec", "data": { "label": "Connection test date suggested", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 950, "y": 775 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 950, "y": 775 } }, { "width": 125, "height": 25, "id": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "data": { "label": "Connection OK", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 725 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 100, "y": 725 } }, { "width": 125, "height": 25, "id": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "data": { "label": "Connection failed", "type": "ERROR", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 487.5, "y": 718.75 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 487.5, "y": 718.75 } }, { "width": 184, "height": 25, "id": "5beb9d9d-815b-433f-834a-a21f5dd88a03", "data": { "label": "Migration letter acknowledged", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 481.25, "y": 475 }, "type": "CustomNode", "selected": false, "dragging": false, "positionAbsolute": { "x": 481.25, "y": 475 } }, { "width": 155, "height": 25, "id": "dd6b58f1-77cc-4a43-8b8a-31a778da785f", "data": { "label": "Connection info received", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 475 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": 100, "y": 475 }, "dragging": false }, { "width": 161, "height": 25, "id": "19a047d6-e432-41e6-bb5c-d4f9a480360f", "data": { "label": "Migration letter sent", "type": "AWAITING_REPLY", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 350 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": 100, "y": 350 }, "dragging": false }, { "width": 128, "height": 25, "id": "124b96ee-a903-4f23-a23e-802fcccbcabd", "data": { "label": "Welcome email sent", "type": "NORMAL", "isEditing": false, "isToolbarShowing": true }, "position": { "x": 100, "y": 225 }, "type": "CustomNode", "selected": false, "positionAbsolute": { "x": 100, "y": 225 }, "dragging": false }, { "width": 125, "height": 25, "id": "218c52b2-a362-45c1-902f-2a7d052e87d2", "data": { "label": "Start", "type": "START", "isEditing": false, "isToolbarShowing": false }, "position": { "x": 100, "y": 100 }, "type": "CustomNode", "positionAbsolute": { "x": 100, "y": 100 } }], "edges": [{ "type": "CustomEdge", "source": "218c52b2-a362-45c1-902f-2a7d052e87d2", "target": "124b96ee-a903-4f23-a23e-802fcccbcabd", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Send welcome email", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "welcome-letter.html", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "936d6714-e233-49cd-b8e8-66383d17e01e" }, { "type": "CustomEdge", "source": "124b96ee-a903-4f23-a23e-802fcccbcabd", "target": "19a047d6-e432-41e6-bb5c-d4f9a480360f", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Send migration letter", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "AS2", "emailTemplate": "as2-migration-letter.html", "hasReminder": true, "reminderEmailTemplate": "as2-migration-letter.html", "constraintsConnectionsIn": ["AS2"], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "SFTP Internal", "emailTemplate": "sftp-int-migration-letter.html", "hasReminder": true, "reminderEmailTemplate": "sftp-int-migration-letter.html", "constraintsConnectionsIn": ["SFTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": ["INTERNAL"], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "SFTP External", "emailTemplate": "sftp-ext-migration-letter.html", "hasReminder": true, "reminderEmailTemplate": "sftp-ext-migration-letter.html", "constraintsConnectionsIn": ["SFTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": ["EXTERNAL"], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "HTTP", "emailTemplate": "http-migration-letter.html", "hasReminder": true, "reminderEmailTemplate": "http-migration-letter.html", "constraintsConnectionsIn": ["HTTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "VAN", "emailTemplate": "van-migration-letter.html", "hasReminder": true, "reminderEmailTemplate": "van-migration-letter.html", "constraintsConnectionsIn": ["VAN"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "Web hook", "emailTemplate": "webhook-migration-letter.html", "hasReminder": true, "reminderEmailTemplate": "webhook-migration-letter.html", "constraintsConnectionsIn": ["WEBHOOK"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "5b690d17-8e69-48b8-bed2-ec3fb3a26f2f" }, { "type": "CustomEdge", "source": "19a047d6-e432-41e6-bb5c-d4f9a480360f", "target": "dd6b58f1-77cc-4a43-8b8a-31a778da785f", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Receive connection info", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "AS2", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": ["AS2"], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "SFTP External", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": ["SFTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": ["EXTERNAL"], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "HTTP", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": ["HTTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "8b27c3e2-87f6-4967-9cb1-4b178ed98808" }, { "type": "CustomEdge", "source": "dd6b58f1-77cc-4a43-8b8a-31a778da785f", "target": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Mark connection OK", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "034da15f-e6ef-48be-88d8-c33b52bff347" }, { "type": "CustomEdge", "source": "31a5eb64-654b-4566-a2b0-39fa04da57be", "target": "dd6b58f1-77cc-4a43-8b8a-31a778da785f", "sourceHandle": "rt_-1_source", "targetHandle": "lt_0_target", "label": "Receive connection info", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "dcbe518d-4eee-4f0e-8b0a-287d9cb37f69" }, { "type": "CustomEdge", "source": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "target": "31a5eb64-654b-4566-a2b0-39fa04da57be", "sourceHandle": "lt_0_source", "targetHandle": "rt_1_target", "label": "Request additional connection info", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "AS2", "emailTemplate": "as2-additional-connection-info.html", "hasReminder": true, "reminderEmailTemplate": "as2-additional-connection-info.html", "constraintsConnectionsIn": ["AS2"], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "SFTP External", "emailTemplate": "sftp-additional-connection-info.html", "hasReminder": true, "reminderEmailTemplate": "sftp-additional-connection-info.html", "constraintsConnectionsIn": ["SFTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": ["EXTERNAL"], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "HTTP", "emailTemplate": "http-additional-connection-info.html", "hasReminder": true, "reminderEmailTemplate": "http-additional-connection-info.html", "constraintsConnectionsIn": ["HTTP"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "97fa9049-5201-4a2f-87d5-011f04cd0d8b" }, { "type": "CustomEdge", "source": "09dbcd98-8e14-421f-b5bb-06ceb5671e5d", "target": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "sourceHandle": "up_0_source", "targetHandle": "dn_0_target", "label": "Mark connection failed", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "b39c187b-56c7-41fd-bf06-8bce47d81d67" }, { "type": "CustomEdge", "source": "492b9012-1022-4e32-a2a8-15e97ec784ec", "target": "09dbcd98-8e14-421f-b5bb-06ceb5671e5d", "sourceHandle": "lt_1_source", "targetHandle": "rt_0_target", "label": "Confirm connection test date", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "44125bfd-4f13-4395-a2dd-c21f4923d12b" }, { "type": "CustomEdge", "source": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "target": "492b9012-1022-4e32-a2a8-15e97ec784ec", "sourceHandle": "rt_0_source", "targetHandle": "lt_-1_target", "label": "Suggest connection test date", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "suggest-connection-test-date.html", "hasReminder": true, "reminderEmailTemplate": "suggest-connection-test-date.html", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "9d4cf05f-d6e7-4c26-b2a4-6d535b86887c" }, { "type": "CustomEdge", "source": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "target": "147325e2-0079-47f6-899a-f41a16ee2617", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Send GoLive T-14 letter", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "golive-t14-letter", "hasReminder": true, "reminderEmailTemplate": "golive-t14-letter", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "a4c33f26-1527-4ab1-8319-f686b01f42de" }, { "type": "CustomEdge", "source": "147325e2-0079-47f6-899a-f41a16ee2617", "target": "ef5d41a7-bc55-40a3-9872-d316a6c91ac1", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Acknowledge", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "503d164c-5de6-400b-a2a8-92c57435dafa" }, { "type": "CustomEdge", "source": "ef5d41a7-bc55-40a3-9872-d316a6c91ac1", "target": "81b21de4-e3b6-4674-b98b-fa3ba020a5dc", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Send GoLive T-5 letter", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "golive-t5-letter", "hasReminder": true, "reminderEmailTemplate": "golive-t5-letter", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "d5b6f0b8-865b-4f03-828c-306b22600fdd" }, { "type": "CustomEdge", "source": "81b21de4-e3b6-4674-b98b-fa3ba020a5dc", "target": "a8b091e1-daa3-42d0-980b-67b31be59759", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Acknowledge", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "7fbc7f04-e0d6-4570-b9ba-b616f3818b56" }, { "type": "CustomEdge", "source": "a8b091e1-daa3-42d0-980b-67b31be59759", "target": "cb2cd55a-8314-4639-8147-aa504d7e1d25", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Send GoLive T-1 letter", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "golive-t1-letter", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "a73a6102-4478-4e02-ab5a-76b58b23dcf7" }, { "type": "CustomEdge", "source": "cb2cd55a-8314-4639-8147-aa504d7e1d25", "target": "d1fbb329-ff28-4d00-adc0-eecb704c379a", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Acknowledge", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "50ca2c83-9e2d-4962-a209-d79b02900285" }, { "type": "CustomEdge", "source": "d1fbb329-ff28-4d00-adc0-eecb704c379a", "target": "c9213646-e31a-4a00-a177-df5936641146", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Mark GoLive", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "golive.html", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "c0bbcc7d-b28b-4109-a7cf-0fb9be21bfc3" }, { "type": "CustomEdge", "source": "c9213646-e31a-4a00-a177-df5936641146", "target": "f836a322-ae52-426f-9b16-afe26f498497", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Mark migration completed", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "migration-complete.html", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "eced268d-9b7d-4e09-9d7d-10727e51ec60" }, { "type": "CustomEdge", "source": "c9213646-e31a-4a00-a177-df5936641146", "target": "c0043690-e7ca-4416-b6d7-ed8e6993bd1d", "sourceHandle": "rt_0_source", "targetHandle": "lt_-1_target", "label": "Request GoLive test load", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "request-live-load.html", "hasReminder": true, "reminderEmailTemplate": "request-live-load.html", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "465f6b0b-b3ac-4b5a-854b-fbff07423daa" }, { "type": "CustomEdge", "source": "c0043690-e7ca-4416-b6d7-ed8e6993bd1d", "target": "f836a322-ae52-426f-9b16-afe26f498497", "sourceHandle": "lt_1_source", "targetHandle": "rt_0_target", "label": "Mark migration completed", "data": { "isEmailAction": true, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "migration-complete.html", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "abc28415-fd28-4dff-8d80-e893f72a49d8" }, { "type": "CustomEdge", "source": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "target": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "sourceHandle": "rt_-1_source", "targetHandle": "lt_-1_target", "label": "Mark connection failed", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "8064155f-b959-472a-8352-f48b0bd5526f" }, { "type": "CustomEdge", "source": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "target": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "sourceHandle": "lt_1_source", "targetHandle": "rt_1_target", "label": "Mark connection OK", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "60a6563b-7ede-431d-a4ed-4a3cfaaef68b" }, { "type": "CustomEdge", "source": "5beb9d9d-815b-433f-834a-a21f5dd88a03", "target": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "sourceHandle": "lt_1_source", "targetHandle": "up_1_target", "label": "Mark connection OK", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "494a0dc6-f3b7-45e9-99f5-3693ea3e96a0" }, { "type": "CustomEdge", "source": "19a047d6-e432-41e6-bb5c-d4f9a480360f", "target": "5beb9d9d-815b-433f-834a-a21f5dd88a03", "sourceHandle": "rt_0_source", "targetHandle": "lt_-1_target", "label": "Acknowledge", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "SFTP Internal", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": ["SFTP"], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": ["INTERNAL"], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "VAN", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": ["VAN"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }, { "label": "Web hook", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": ["WEBHOOK"], "constraintsConnectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "7fce1dc6-a02b-49db-aa2f-ad810ceef97b" }, { "type": "CustomEdge", "id": "396720be-5665-4bee-baa7-232c71036274", "source": "5beb9d9d-815b-433f-834a-a21f5dd88a03", "target": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "sourceHandle": "dn_0_source", "targetHandle": "up_0_target", "label": "Mark connection failed", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false }, { "type": "CustomEdge", "source": "09dbcd98-8e14-421f-b5bb-06ceb5671e5d", "target": "3ec92d51-fda1-44e9-8cee-b95b4f02106a", "sourceHandle": "lt_0_source", "targetHandle": "dn_1_target", "label": "Mark connection OK", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "ae3c4457-2426-4d78-bc5f-c5fdd4d76a39" }, { "type": "CustomEdge", "source": "dd6b58f1-77cc-4a43-8b8a-31a778da785f", "target": "12fabbec-8c88-41c6-b8b9-2166b1332eae", "sourceHandle": "dn_1_source", "targetHandle": "up_-1_target", "label": "Mark connection failed", "data": { "isEmailAction": false, "isToolbarShowing": true, "variants": [{ "label": "", "emailTemplate": "", "hasReminder": false, "reminderEmailTemplate": "", "constraintsConnectionsIn": [], "constraintsConnectionsNotIn": [], "constraintsDirectionsIn": [], "constraintsDirectionsNotIn": [], "constraintsOriginsIn": [], "constraintsOriginsNotIn": [], "constraintsStatesIn": [], "constraintsStatesNotIn": [] }] }, "selected": false, "id": "e0db3803-0bef-4774-8aa4-b4df39ae9b93" }], "viewport": { "x": 773.7211143695015, "y": -5.7360703812315705, "zoom": 0.573607038123167 } }

const START_NODE: Node<State> = { id: v4(), data: { label: 'Start', type: Type.START, isEditing: false, isToolbarShowing: false }, position: { x: 100, y: 100 }, type: 'CustomNode' };

export const App: React.FC = () => {
  //
  const { addNodes, screenToFlowPosition, setViewport } = useReactFlow<State, Action>();

  const nodeTypes = useMemo(() => ({ CustomNode }), []);
  const edgeTypes = useMemo(() => ({ CustomEdge, SmartBezierEdge, SmartStepEdge }), []);

  const setSelectedNodeIds = useSetRecoilState(selectedNodeIdsState);
  const setSelectedEdgeIds = useSetRecoilState(selectedEdgeIdsState);

  // const defaultEdgeOptions = useMemo(
  //   () =>
  //     ({
  //       animated: true,
  //       style: {
  //         stroke: '#404040',
  //         strokeWidth: '2px',
  //       },
  //       interactionWidth: 10,
  //       markerEnd: {
  //         strokeWidth: 2,
  //         color: '#404040',
  //         type: MarkerType.Arrow,
  //       },
  //       type: 'CustomEdge',
  //     } as DefaultEdgeOptions),
  //   [],
  // );

  const [nodes, setNodes, onNodesChange] = useNodesState<State>([START_NODE]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Action>([]);

  const onDoubleClick = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      addNodes({
        id: v4(),
        data: {
          label: uniqueId('Stage #'),
          type: Type.NORMAL,
          isEditing: true,
          isToolbarShowing: true,
        },
        position: screenToFlowPosition({ x: ev.clientX, y: ev.clientY }),
        type: 'CustomNode',
        selected: true,
      });
    },
    [addNodes, screenToFlowPosition],
  );

  const onSelectionChanged = useCallback<OnSelectionChangeFunc>(
    ({ nodes, edges }: { nodes: Node<State>[]; edges: Edge<Action>[] }) => {
      setSelectedNodeIds(nodes.map(it => it.id));
      setSelectedEdgeIds(edges.map(it => it.id));
    },
    [setSelectedEdgeIds, setSelectedNodeIds],
  );

  const onConnect = useCallback<OnConnect>(
    ({ source, target, sourceHandle, targetHandle }) => {
      if (!source || !target) return;
      if (!sourceHandle || !targetHandle) return;
      const sourceNode = nodes.find(node => node.id === source);
      const targetNode = nodes.find(node => node.id === target);
      if (!sourceNode || !targetNode) return;
      if (edges.some(edge => edge.source === source && edge.target === target)) {
        showToast2('Connection already exists');
        // setEdges(edges => edges.filter(edge => edge.source !== source || edge.target !== target));
        return;
      }
      setEdges(edges =>
        addEdge(
          {
            type: 'CustomEdge',
            // type: undefined,
            id: v4(),
            source,
            target,
            sourceHandle,
            targetHandle,
            label: uniqueId('Action #'),
            data: {
              isEmailAction: false,
              isToolbarShowing: true,
              variants: [
                {
                  label: '',
                  emailTemplate: '',
                  hasReminder: false,
                  reminderEmailTemplate: '',
                  constraintsConnectionsIn: [],
                  constraintsConnectionsNotIn: [],
                  constraintsDirectionsIn: [],
                  constraintsDirectionsNotIn: [],
                  constraintsOriginsIn: [],
                  constraintsOriginsNotIn: [],
                  constraintsStatesIn: [],
                  constraintsStatesNotIn: [],
                },
              ],
            },
          },
          edges,
        ),
      );
    },
    [edges, nodes, setEdges],
  );

  const onEdgeUpdate = useCallback<OnEdgeUpdateFunc<Action>>(
    (edge, newConnection) => {
      setEdges(edges => updateEdge(edge, newConnection, edges, {}));
    },
    [setEdges],
  );

  const onNodesDelete = useCallback<OnNodesDelete>(
    deletedNodes => {
      setEdges(
        deletedNodes.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);
          const remainingEdges = acc.filter(edge => !connectedEdges.includes(edge));
          const createdEdges = incomers.flatMap(({ id: source }) => outgoers.map(({ id: target }) => ({ id: v4(), source, target, label: uniqueId('Action #') })));
          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [edges, nodes, setEdges],
  );

  // const getClosestEdge = useCallback((node: Node<State>) => {
  //   const { nodeInternals } = store.getState();
  //   const storeNodes = Array.from(nodeInternals.values());

  //   const closestNode = storeNodes.reduce(
  //     (res, n) => {
  //       if (n.id !== node.id) {
  //         const dx = (n.positionAbsolute?.x ?? 0) - (node.positionAbsolute?.x ?? 0);
  //         const dy = (n.positionAbsolute?.y ?? 0) - (node.positionAbsolute?.y ?? 0);
  //         const d = Math.sqrt(dx * dx + dy * dy);

  //         if (d < res.distance && d < 200) {
  //           res.distance = d;
  //           res.node = n;
  //         }
  //       }

  //       return res;
  //     },
  //     {
  //       distance: Number.MAX_VALUE,
  //       node: null,
  //     },
  //   );

  //   if (!closestNode.node) {
  //     return null;
  //   }

  //   const closeNodeIsSource = closestNode.node.positionAbsolute.x < node.positionAbsolute.x;

  //   return {
  //     id: closeNodeIsSource ? `${closestNode.node.id}-${node.id}` : `${node.id}-${closestNode.node.id}`,
  //     source: closeNodeIsSource ? closestNode.node.id : node.id,
  //     target: closeNodeIsSource ? node.id : closestNode.node.id,
  //   };
  // }, []);

  // const onNodeDrag = useCallback<NodeDragHandler>(
  //   (_, node) => {
  //     const closeEdge = getClosestEdge(node);

  //     setEdges(es => {
  //       const nextEdges = es.filter(e => e.className !== 'temp');

  //       if (closeEdge && !nextEdges.find(ne => ne.source === closeEdge.source && ne.target === closeEdge.target)) {
  //         closeEdge.className = 'temp';
  //         nextEdges.push(closeEdge);
  //       }

  //       return nextEdges;
  //     });
  //   },
  //   [getClosestEdge, setEdges],
  // );

  // const onNodeDragStop = useCallback<NodeDragHandler>(
  //   (_, node) => {
  //     const closeEdge = getClosestEdge(node);

  //     setEdges(es => {
  //       const nextEdges = es.filter(e => e.className !== 'temp');

  //       if (closeEdge && !nextEdges.find(ne => ne.source === closeEdge.source && ne.target === closeEdge.target)) {
  //         closeEdge.label = uniqueId('Action #')
  //         nextEdges.push(closeEdge);
  //       }

  //       return nextEdges;
  //     });
  //   },
  //   [getClosestEdge, setEdges],
  // );

  const flowKey = 'example-flow';
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<State, Action> | null>(null);

  const save = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const load = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey) ?? '{}');
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };
    restoreFlow();
  }, [setEdges, setNodes, setViewport]);

  const clear = useCallback(() => {
    setNodes([START_NODE]);
    setEdges([]);
  }, [setEdges, setNodes]);

  const initialize = useCallback(() => {
    localStorage.setItem(flowKey, JSON.stringify(WORKFLOW_JSON));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="arrow-dark-grey-down" viewBox="0 0 10 6" markerWidth={10} markerHeight={5} refX={5} refY={5}>
            <path d="M1 1 L5 5 L9 1" stroke="#404040" strokeWidth="1.2px" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          </marker>
          <marker id="arrow-light-grey-down" viewBox="0 0 10 6" markerWidth={10} markerHeight={5} refX={5} refY={5}>
            <path d="M1 1 L5 5 L9 1" stroke="#C0C0C0" strokeWidth="1.2px" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          </marker>
        </defs>
      </svg>
      <ReactFlow //
        onInit={setRfInstance}
        // connectionLineComponent={ConnectionLine}
        // defaultEdgeOptions={defaultEdgeOptions}
        edges={edges}
        edgeTypes={edgeTypes}
        nodes={nodes}
        nodeOrigin={[0.5, 0.5]}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onDoubleClick={onDoubleClick}
        onEdgesChange={onEdgesChange}
        onEdgeUpdate={onEdgeUpdate}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStop={onNodeDragStop}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onSelectionChange={onSelectionChanged}
        snapGrid={[25 / 4, 25 / 4]}
        snapToGrid
        style={{ width: '100vw', height: '100vh' }}
        zoomOnDoubleClick={false}>
        <CustomEdgeToolbarPlaceholder />
        <MiniMap></MiniMap>
        <Controls onDoubleClick={prevent}>
          <Button variant='text' size='small' onClick={save}>Save</Button>
          <Button variant='text' size='small' onClick={load}>Reload</Button>
          <Button variant='text' size='small' onClick={clear}>Reset</Button>
          <Button variant='text' size='small' onClick={initialize}>Initialize</Button>
        </Controls>
        <Background color="#f4f4f4" gap={25} variant={BackgroundVariant.Lines}></Background>
      </ReactFlow>
    </div>
  );
};

// const ConnectionLine: React.FC<ConnectionLineComponentProps> = ({ fromHandle, fromNode, toX, toY }) => {
//   const nodes = useNodes<State>();
//   const handleBounds = useMemo(
//     () =>
//       nodes
//         .flatMap(node => {
//           if (node?.id !== fromNode?.id && !node.selected) return [];
//           return node[internalsSymbol]?.handleBounds?.source?.map(bounds => ({
//             id: node.id,
//             positionAbsolute: node.positionAbsolute,
//             bounds,
//           }));
//         })
//         .filter(it => !!it)
//         .map(it => it!),
//     [fromNode?.id, nodes],
//   );

//   if (!handleBounds) return null;

//   return handleBounds.map(({ id, positionAbsolute, bounds }) => {
//     if (!positionAbsolute) return null;
//     const fromHandleX = bounds.x + bounds.width / 2;
//     const fromHandleY = bounds.y + bounds.height / 2;
//     const fromX = positionAbsolute.x + fromHandleX;
//     const fromY = positionAbsolute.y + fromHandleY;
//     const [d] = getSimpleBezierPath({
//       sourceX: fromX,
//       sourceY: fromY,
//       targetX: toX,
//       targetY: toY,
//     });

//     return (
//       <g key={`${id}-${bounds.id}`}>
//         <path fill="none" strokeWidth={1.5} stroke="black" d={d} />
//         <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="black" strokeWidth={1.5} />
//       </g>
//     );
//   });
// };
