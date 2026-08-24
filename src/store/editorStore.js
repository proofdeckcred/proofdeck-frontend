// editorStore.js
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { produce } from "immer";

const PAGE_SIZES = {
  A4: {
    landscape: { width: 842, height: 595 },
    portrait: { width: 595, height: 842 },
  },
  US_LETTER: {
    landscape: { width: 792, height: 612 },
    portrait: { width: 612, height: 792 },
  },
};

const useEditorStore = create((set, get) => ({
  templateTitle: "Untitled Template",
  elements: [],
  selectedIds: [],
  background: { fill: "#FFFFFF", image: null },
  canvas: { ...PAGE_SIZES.A4.landscape, size: "A4", orientation: "landscape" },
  clipboard: [],
  history: [],
  historyIndex: -1,

  // --- Core Actions ---
  setTemplateTitle: (title) => set({ templateTitle: title }),

  updateStateWithHistory: (newState) => {
    set(
      produce((state) => {
        const currentSnapshot = {
          elements: state.elements.map((el) => ({ ...el })), // deep copy
          background: { ...state.background },
          canvas: { ...state.canvas },
        };

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(currentSnapshot);

        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;

        for (const key in newState) {
          state[key] = newState[key];
        }
      })
    );
  },

  setElements: (elements) => {
    get().updateStateWithHistory({ elements });
  },

  addElement: (type, props = {}) => {
    let newElement;
    const commonProps = {
      id: uuidv4(),
      x: 50,
      y: 50,
      rotation: 0,
      parentId: null,
      textDecoration: "none",
    };

    switch (type) {
      case "text":
        newElement = {
          ...commonProps,
          type: "text",
          text: "New Text",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
          width: 200,
          height: 30,
          fontStyle: "normal",
          align: "left",
          ...props,
        };
        break;
      case "image":
        newElement = {
          ...commonProps,
          type: "image",
          keepAspectRatio: true,
          ...props,
        };
        break;
      case "shape":
        newElement = {
          ...commonProps,
          type: "shape",
          shapeType: "rect",
          width: 100,
          height: 100,
          fill: "#cccccc",
          stroke: "#000000",
          strokeWidth: 1,
          cornerRadius: 0,
          ...props,
        };
        break;
      case "placeholder":
        newElement = {
          ...commonProps,
          type: "placeholder",
          text: props.text || "{{recipient_name}}",
          fontSize: 20,
          fontFamily: "Arial",
          fill: "#000000",
          width: 250,
          height: 25,
          ...props,
        };
        break;
      case "group":
        newElement = {
          ...commonProps,
          type: "group",
          scaleX: 1,
          scaleY: 1,
          childrenIds: [],
          ...props,
        };
        break;
      default:
        return;
    }
    get().updateStateWithHistory({
      elements: [...get().elements, newElement],
      selectedIds: [newElement.id],
    });
  },

  updateElement: (id, props) => {
    set(
      produce((state) => {
        const el = state.elements.find((e) => e.id === id);
        if (el) {
          Object.assign(el, props);
        }
      })
    );
  },

  updateSelectedElements: (propsUpdater) => {
    set(
      produce((state) => {
        state.selectedIds.forEach((id) => {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            const newProps =
              typeof propsUpdater === "function"
                ? propsUpdater(el)
                : propsUpdater;
            Object.assign(el, newProps);
          }
        });
      })
    );
  },

  commitUpdate: () => {
    get().updateStateWithHistory({ elements: get().elements });
  },

  deleteSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length > 0) {
      const toDelete = new Set(selectedIds);
      selectedIds.forEach((id) => {
        const el = elements.find((e) => e.id === id);
        if (el && el.type === "group") {
          el.childrenIds.forEach((childId) => toDelete.add(childId));
        }
      });
      get().updateStateWithHistory({
        elements: elements.filter((el) => !toDelete.has(el.id)),
        selectedIds: [],
      });
    }
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  setCanvasConfig: (config) => {
    const currentCanvas = get().canvas;
    const newConfig = { ...currentCanvas, ...config };
    const newDimensions = PAGE_SIZES[newConfig.size][newConfig.orientation];
    get().updateStateWithHistory({
      canvas: { ...newConfig, ...newDimensions },
    });
  },

  setBackground: (props) => {
    get().updateStateWithHistory({
      background: { ...get().background, ...props },
    });
  },

  moveSelection: (direction) => {
    const { elements, selectedIds } = get();
    if (selectedIds.length !== 1) return;
    const selectedId = selectedIds[0];

    const index = elements.findIndex((e) => e.id === selectedId);
    if (index === -1) return;

    const newElements = [...elements];
    const [item] = newElements.splice(index, 1);

    if (direction === "up" && index < newElements.length)
      newElements.splice(index + 1, 0, item);
    else if (direction === "down" && index > 0)
      newElements.splice(index - 1, 0, item);
    else if (direction === "top") newElements.push(item);
    else if (direction === "bottom") newElements.unshift(item);

    get().updateStateWithHistory({ elements: newElements });
  },

  copySelection: () => {
    const { elements, selectedIds } = get();
    const copied = elements
      .filter((el) => selectedIds.includes(el.id))
      .map((el) => ({ ...el }));
    set({ clipboard: copied });
  },

  pasteFromClipboard: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;

    const newElements = clipboard.map((el) => ({
      ...el,
      id: uuidv4(),
      x: el.x + 20,
      y: el.y + 20,
    }));

    const newIds = newElements.map((el) => el.id);
    get().updateStateWithHistory({
      elements: [...get().elements, ...newElements],
      selectedIds: newIds,
    });
  },

  duplicateSelection: () => {
    get().copySelection();
    get().pasteFromClipboard();
  },

  alignSelection: (edge) => {
    const { elements, selectedIds } = get();
    if (selectedIds.length < 2) return;

    const selected = elements.filter((el) => selectedIds.includes(el.id));

    let target;
    switch (edge) {
      case "left":
        target = Math.min(...selected.map((el) => el.x));
        break;
      case "right":
        target = Math.max(...selected.map((el) => el.x + el.width));
        break;
      case "h-center":
        const hCenterMin = Math.min(...selected.map((el) => el.x));
        const hCenterMax = Math.max(...selected.map((el) => el.x + el.width));
        target = (hCenterMin + hCenterMax) / 2;
        break;
      case "top":
        target = Math.min(...selected.map((el) => el.y));
        break;
      case "bottom":
        target = Math.max(...selected.map((el) => el.y + el.height));
        break;
      case "v-center":
        const vCenterMin = Math.min(...selected.map((el) => el.y));
        const vCenterMax = Math.max(...selected.map((el) => el.y + el.height));
        target = (vCenterMin + vCenterMax) / 2;
        break;
      default:
        return;
    }

    const newElements = elements.map((el) => {
      if (!selectedIds.includes(el.id)) return el;
      switch (edge) {
        case "left":
          return { ...el, x: target };
        case "right":
          return { ...el, x: target - el.width };
        case "h-center":
          return { ...el, x: target - el.width / 2 };
        case "top":
          return { ...el, y: target };
        case "bottom":
          return { ...el, y: target - el.height };
        case "v-center":
          return { ...el, y: target - el.height / 2 };
        default:
          return el;
      }
    });

    get().updateStateWithHistory({ elements: newElements });
  },

  distributeSelection: (direction) => {
    const { elements, selectedIds } = get();
    if (selectedIds.length < 3) return;

    const selected = elements.filter((el) => selectedIds.includes(el.id));

    let newElements = [...elements];
    if (direction === "horizontal") {
      const sorted = [...selected].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const maxX =
        sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
      const itemWidths = sorted.reduce((sum, el) => sum + el.width, 0);
      const spacing = (maxX - minX - itemWidths) / (sorted.length - 1);
      let currentX = minX;
      sorted.forEach((el) => {
        const index = newElements.findIndex((e) => e.id === el.id);
        newElements[index].x = currentX;
        currentX += el.width + spacing;
      });
    } else if (direction === "vertical") {
      const sorted = [...selected].sort((a, b) => a.y - b.y);
      const minY = sorted[0].y;
      const maxY =
        sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
      const itemHeights = sorted.reduce((sum, el) => sum + el.height, 0);
      const spacing = (maxY - minY - itemHeights) / (sorted.length - 1);
      let currentY = minY;
      sorted.forEach((el) => {
        const index = newElements.findIndex((e) => e.id === el.id);
        newElements[index].y = currentY;
        currentY += el.height + spacing;
      });
    }

    get().updateStateWithHistory({ elements: newElements });
  },

  groupSelected: () => {
    const { elements, selectedIds } = get();
    if (selectedIds.length < 2) return;

    const selected = elements.filter(
      (el) => selectedIds.includes(el.id) && !el.parentId
    );

    const minX = Math.min(...selected.map((el) => el.x));
    const minY = Math.min(...selected.map((el) => el.y));

    const groupId = uuidv4();
    const group = {
      id: groupId,
      type: "group",
      x: minX,
      y: minY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      childrenIds: selected.map((el) => el.id),
    };

    const newElements = produce(elements, (draft) => {
      draft.push(group);
      selected.forEach((sel) => {
        const el = draft.find((e) => e.id === sel.id);
        el.parentId = groupId;
        el.x -= minX;
        el.y -= minY;
      });
    });

    get().updateStateWithHistory({
      elements: newElements,
      selectedIds: [groupId],
    });
  },

  ungroupSelected: () => {
    const { elements, selectedIds } = get();
    if (selectedIds.length !== 1) return;

    const groupId = selectedIds[0];
    const group = elements.find(
      (el) => el.id === groupId && el.type === "group"
    );
    if (!group) return;

    const angle = (group.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const scaleX = group.scaleX;
    const scaleY = group.scaleY;

    const newElements = produce(elements, (draft) => {
      const groupIndex = draft.findIndex((el) => el.id === groupId);
      draft.splice(groupIndex, 1);

      group.childrenIds.forEach((childId) => {
        const child = draft.find((el) => el.id === childId);
        if (!child) return;

        const relX = child.x * scaleX;
        const relY = child.y * scaleY;
        const rotX = relX * cos - relY * sin;
        const rotY = relX * sin + relY * cos;

        child.x = group.x + rotX;
        child.y = group.y + rotY;
        child.rotation = (child.rotation || 0) + group.rotation;
        child.width *= scaleX;
        child.height *= scaleY;

        if (child.type === "text" || child.type === "placeholder") {
          child.fontSize *= (scaleX + scaleY) / 2;
        }
        if (child.type === "shape") {
          child.strokeWidth *= (scaleX + scaleY) / 2;
        }

        child.parentId = null;
      });
    });

    get().updateStateWithHistory({
      elements: newElements,
      selectedIds: group.childrenIds,
    });
  },

  toggleBold: () => {
    get().updateSelectedElements((el) => {
      let style = el.fontStyle || "";
      style = style.includes("bold")
        ? style.replace(/\bbold\b/g, "").trim()
        : `${style} bold`.trim();
      return { fontStyle: style };
    });
    get().commitUpdate();
  },

  toggleItalic: () => {
    get().updateSelectedElements((el) => {
      let style = el.fontStyle || "";
      style = style.includes("italic")
        ? style.replace(/\bitalic\b/g, "").trim()
        : `${style} italic`.trim();
      return { fontStyle: style };
    });
    get().commitUpdate();
  },

  toggleUnderline: () => {
    get().updateSelectedElements((el) => ({
      textDecoration: el.textDecoration === "underline" ? "none" : "underline",
    }));
    get().commitUpdate();
  },

  addCombination: (type) => {
    const { elements } = get();
    if (type === "signature") {
      const sigId = uuidv4();
      const nameId = uuidv4();
      const posX = 50;
      const posY = 50;

      const sig = {
        id: sigId,
        type: "placeholder",
        text: "{{signature}}",
        fontFamily: "Dancing Script",
        fontSize: 32,
        fill: "#000000",
        x: posX,
        y: posY,
        width: 200,
        height: 40,
        align: "left",
        fontStyle: "normal",
        textDecoration: "none",
        parentId: null,
      };

      const name = {
        id: nameId,
        type: "text",
        text: "Name, Title",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#000000",
        x: posX,
        y: posY + 40,
        width: 200,
        height: 20,
        align: "left",
        fontStyle: "normal",
        textDecoration: "none",
        parentId: null,
      };

      get().updateStateWithHistory({
        elements: [...elements, sig, name],
        selectedIds: [sigId, nameId],
      });
    }
  },

  undo: () => {
    set(
      produce((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const prev = state.history[newIndex];
          state.elements = prev.elements;
          state.background = prev.background;
          state.canvas = prev.canvas;
          state.historyIndex = newIndex;
        }
      })
    );
  },

  redo: () => {
    set(
      produce((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const next = state.history[newIndex];
          state.elements = next.elements;
          state.background = next.background;
          state.canvas = next.canvas;
          state.historyIndex = newIndex;
        }
      })
    );
  },

  getFlattenedElements: () => {
    const { elements } = get();
    const flat = [];

    elements.forEach((el) => {
      if (el.parentId) return;
      if (el.type === "group") {
        const angle = (el.rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const scaleX = el.scaleX || 1;
        const scaleY = el.scaleY || 1;

        el.childrenIds.forEach((childId) => {
          const child = elements.find((c) => c.id === childId);
          if (!child) return;

          const relX = child.x * scaleX;
          const relY = child.y * scaleY;
          const rotX = relX * cos - relY * sin;
          const rotY = relX * sin + relY * cos;

          const absChild = {
            ...child,
            x: el.x + rotX,
            y: el.y + rotY,
            rotation: (child.rotation || 0) + el.rotation,
            width: child.width * scaleX,
            height: child.height * scaleY,
          };

          if (child.type === "text" || child.type === "placeholder") {
            absChild.fontSize = child.fontSize * ((scaleX + scaleY) / 2);
          }
          if (child.type === "shape") {
            absChild.strokeWidth = child.strokeWidth * ((scaleX + scaleY) / 2);
          }

          delete absChild.parentId;
          flat.push(absChild);
        });
      } else {
        flat.push({ ...el });
      }
    });

    return flat;
  },

  loadTemplate: (data) => {
    const canvasConfig = data.layout_data?.canvas || {
      ...PAGE_SIZES.A4.landscape,
      size: "A4",
      orientation: "landscape",
    };
    let elementsData = data.layout_data?.elements || [];
    elementsData = elementsData.map((el) => ({ ...el, parentId: null })); // ensure flat
    const backgroundData = data.layout_data?.background || {
      fill: "#FFFFFF",
      image: null,
    };

    const initialState = {
      templateTitle: data.title,
      elements: elementsData,
      background: backgroundData,
      canvas: canvasConfig,
      selectedIds: [],
      clipboard: [],
      history: [
        {
          elements: elementsData,
          background: backgroundData,
          canvas: canvasConfig,
        },
      ],
      historyIndex: 0,
    };
    set(initialState);
  },
}));

export default useEditorStore;
