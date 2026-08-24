import React, { useState, useRef, createRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  RotateCcw,
  RotateCw,
  Grid,
  FileBadge,
  Receipt,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import {
  createCustomTemplate,
  getTemplate,
  updateCustomTemplate,
} from "../api";
import CustomTemplateEditor from "../components/CustomTemplateEditor";
import TextElementControls from "../components/TextElementControls";
import { SERVER_BASE_URL } from "../config";

// --- PLACEHOLDER CONFIGURATIONS ---
const CERTIFICATE_PLACEHOLDERS = [
  { name: "Recipient Name", value: "{{recipient_name}}", defaultWidth: 350 },
  { name: "Course Title", value: "{{course_title}}", defaultWidth: 400 },
  { name: "Issue Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Verification ID", value: "{{verification_id}}", defaultWidth: 300 },
  { name: "Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const RECEIPT_PLACEHOLDERS = [
  { name: "Payer Name", value: "{{recipient_name}}", defaultWidth: 300 }, // Maps to recipient
  { name: "Total Amount", value: "{{amount}}", defaultWidth: 150 },
  { name: "Payment Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Description", value: "{{course_title}}", defaultWidth: 350 }, // Maps to course/event
  { name: "Receipt / Txn ID", value: "{{verification_id}}", defaultWidth: 250 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Auth Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const DraggablePlaceholder = ({ placeholder }) => (
  <div
    draggable
    className="text-sm bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-sm text-gray-700 p-3 rounded-md cursor-grab active:cursor-grabbing mb-2 transition-all flex items-center justify-between group"
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify(placeholder));
    }}
  >
    <span className="font-medium group-hover:text-indigo-600">
      {placeholder.name}
    </span>
    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 font-mono">
      {placeholder.value.replace(/[{}]/g, "")}
    </span>
  </div>
);

const UploadTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateType, setTemplateType] = useState("certificate"); // 'certificate' or 'receipt'
  const [templateImageFile, setTemplateImageFile] = useState(null);
  const [templateImageUrl, setTemplateImageUrl] = useState(null);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 842, height: 595 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [showGrid, setShowGrid] = useState(true);
  const fileInputRef = useRef(null);
  const stageRef = createRef();

  useEffect(() => {
    if (templateId) {
      const fetchTemplateData = async () => {
        try {
          const response = await getTemplate(templateId);
          const { title, layout_data } = response.data;
          setTemplateTitle(title);

          if (layout_data) {
            // Restore template type if saved
            if (layout_data.type) setTemplateType(layout_data.type);

            const loadedElements = (layout_data.elements || []).map(
              (el, index) => ({
                ...el,
                id:
                  el.id ||
                  `el_${Math.random().toString(36).substring(2, 11)}_${index}`,
              })
            );
            setElements(loadedElements);
            setCanvasSize(layout_data.canvas || { width: 842, height: 595 });
            if (layout_data.background?.image) {
              setTemplateImageUrl(
                `${SERVER_BASE_URL}${layout_data.background.image}`
              );
            }
            setHistory([loadedElements]);
            setCurrentStep(0);
          }
        } catch (error) {
          toast.error("Failed to load template data.");
          navigate("/dashboard/templates");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplateData();
    }
  }, [templateId, navigate]);

  useEffect(() => {
    if (!isLoadingHistory) {
      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(elements);
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    } else {
      setIsLoadingHistory(false);
    }
  }, [elements]);

  const handleUndo = () => {
    if (currentStep > 0) {
      setIsLoadingHistory(true);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setElements(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setIsLoadingHistory(true);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setElements(history[nextStep]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          // Default to A4 width (landscape) or keep ratio
          const canvasWidth = 842;
          const canvasHeight = canvasWidth / aspectRatio;
          setCanvasSize({ width: canvasWidth, height: canvasHeight });
          setTemplateImageUrl(event.target.result);
          setTemplateImageFile(file);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid PNG or JPG image.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const pos = stageRef.current.getPointerPosition();
    const placeholder = JSON.parse(e.dataTransfer.getData("text/plain"));

    const defaultWidth = placeholder.defaultWidth || 250;
    const isQr = placeholder.isQr || false;

    const newElement = {
      id: `el_${Math.random().toString(36).substring(2, 11)}`,
      type: "placeholder",
      text: placeholder.value,
      x: pos.x - defaultWidth / 2,
      y: pos.y - 15,
      width: defaultWidth,
      height: 30,
      fontSize: 20,
      fontFamily: "Times New Roman",
      fill: "#000000",
      align: isQr ? "center" : "left",
      fontStyle: "normal",
      rotation: 0,
      verticalAlign: "middle",
      isQr,
    };

    if (isQr) {
      newElement.x = pos.x - 50;
      newElement.y = pos.y - 50;
      newElement.width = 100;
      newElement.height = 100;
    }

    setElements([...elements, newElement]);
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim())
      return toast.error("Please provide a title for your template.");
    if (!templateImageUrl)
      return toast.error("Please upload or keep a template image.");
    if (elements.length === 0)
      return toast.error("Please add at least one placeholder element.");

    setIsSubmitting(true);
    const layoutData = {
      type: templateType, // Save the type (certificate/receipt)
      canvas: canvasSize,
      elements: elements.map((el) => ({
        id: el.id,
        type: "placeholder",
        text: el.text,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fill: el.fill,
        align: el.align,
        fontStyle: el.fontStyle,
        rotation: el.rotation,
        verticalAlign: el.verticalAlign,
        isQr: el.isQr,
      })),
    };

    if (templateId && !templateImageFile && templateImageUrl) {
      const relativePath = templateImageUrl.replace(SERVER_BASE_URL, "");
      layoutData.background = { image: relativePath };
    }

    const formData = new FormData();
    formData.append("title", templateTitle);
    formData.append("layout_data", JSON.stringify(layoutData));
    if (templateImageFile) {
      formData.append("template_image", templateImageFile);
    }

    const promise = templateId
      ? updateCustomTemplate(templateId, formData)
      : createCustomTemplate(formData);

    toast.promise(promise, {
      loading: templateId ? "Updating template..." : "Saving template...",
      success: () => {
        setTimeout(() => navigate("/dashboard/templates"), 1500);
        return `Template ${templateId ? "updated" : "saved"} successfully!`;
      },
      error: (err) => err.response?.data?.msg || `Failed to save template.`,
    });
    promise.finally(() => setIsSubmitting(false));
  };

  const selectedElement = elements.find((el) => el.id === selectedId);
  const activePlaceholders =
    templateType === "receipt"
      ? RECEIPT_PLACEHOLDERS
      : CERTIFICATE_PLACEHOLDERS;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Toaster position="top-center" />
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/templates")}
            className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <input
            type="text"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            placeholder="Untitled Template"
            className="text-lg font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-400 bg-transparent w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium mr-4">
            <button
              onClick={() => setTemplateType("certificate")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                templateType === "certificate"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileBadge size={16} /> Certificate
            </button>
            <button
              onClick={() => setTemplateType("receipt")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                templateType === "receipt"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Receipt size={16} /> Receipt
            </button>
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-md transition-colors ${
              showGrid
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Toggle Grid"
          >
            <Grid size={18} />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <button
            onClick={handleUndo}
            disabled={currentStep <= 0}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30 p-2 rounded-md hover:bg-gray-100"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={currentStep >= history.length - 1}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30 p-2 rounded-md hover:bg-gray-100"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 disabled:opacity-70 shadow-sm transition-all ml-2"
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Save size={18} />
            )}
            <span>Save</span>
          </button>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-12 gap-0 overflow-hidden">
        <aside className="col-span-3 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              {templateType === "receipt" ? (
                <Receipt size={20} className="text-indigo-600" />
              ) : (
                <FileBadge size={20} className="text-indigo-600" />
              )}
              {templateType === "receipt"
                ? "Receipt Editor"
                : "Certificate Editor"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Drag fields to design your layout.
            </p>
          </div>

          <div className="flex-grow overflow-y-auto p-5">
            {isLoading ? (
              <div className="text-center py-10">
                <Spinner variant="primary" />
              </div>
            ) : !templateImageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-800">Upload Design</h4>
                <p className="text-xs text-gray-500 mt-2">
                  Upload a blank {templateType} background (JPG/PNG).
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Variables
                    </h4>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      Change Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    {activePlaceholders.map((p) => (
                      <DraggablePlaceholder key={p.value} placeholder={p} />
                    ))}
                  </div>
                </div>

                {selectedElement && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Settings
                    </h4>
                    <TextElementControls
                      element={selectedElement}
                      onUpdate={(updatedAttrs) => {
                        const updatedElements = elements.map((el) =>
                          el.id === selectedId ? { ...el, ...updatedAttrs } : el
                        );
                        setElements(updatedElements);
                      }}
                      onDelete={() => {
                        setElements(
                          elements.filter((el) => el.id !== selectedId)
                        );
                        setSelectedId(null);
                      }}
                      onDone={() => setSelectedId(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <main
          className="col-span-9 bg-gray-100 flex items-center justify-center overflow-auto p-8 relative h-[calc(100vh-64px)]"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {templateImageUrl ? (
            <CustomTemplateEditor
              stageRef={stageRef}
              backgroundImageUrl={templateImageUrl}
              elements={elements}
              setElements={setElements}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              canvasSize={canvasSize}
              showGrid={showGrid}
            />
          ) : (
            <div className="text-center text-gray-400 select-none pointer-events-none">
              <UploadCloud size={64} className="mx-auto opacity-20 mb-4" />
              <p className="text-lg font-medium">Canvas Empty</p>
              <p className="text-sm">
                Upload a template image from the sidebar to begin.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UploadTemplatePage;
