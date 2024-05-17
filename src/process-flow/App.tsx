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
import { IconButton } from '@mui/material';
import { Clear, Replay, Save } from '@mui/icons-material';
import { showToast2 } from './MySnackbar';

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
          <IconButton onClick={save}>
            <Save />
          </IconButton>
          <IconButton onClick={load}>
            <Replay />
          </IconButton>
          <IconButton onClick={clear}>
            <Clear />
          </IconButton>
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
