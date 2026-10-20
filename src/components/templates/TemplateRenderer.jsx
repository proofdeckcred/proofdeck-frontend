import React, { useEffect, useRef, useState } from 'react';
import KonvaPreview from '../KonvaPreview'; // Adjust path as needed
import { LayoutTemplate } from 'lucide-react';
import { SERVER_BASE_URL } from '../../config';
import { useUser } from '../../context/UserContext';

// Import Styles
import Classic from './styles/Classic';
import Modern from './styles/Modern';
import Receipt from './styles/Receipt';
import ModernLandscape from './styles/ModernLandscape';
import ElegantSerif from './styles/ElegantSerif';
import MinimalistBold from './styles/MinimalistBold';
import CorporateBlue from './styles/CorporateBlue';
import TechDark from './styles/TechDark';
import CreativeArt from './styles/CreativeArt';
import BadgeCert from './styles/BadgeCert';
import AwardGold from './styles/AwardGold';
import DiplomaClassic from './styles/DiplomaClassic';
import AchievementStar from './styles/AchievementStar';

const BASE_WIDTH = 1122;
const BASE_HEIGHT = 794;

const TemplateRenderer = ({ template, formData = {}, isFullscreen = false }) => {
    const userCtx = useUser();
    const currentUser = userCtx?.user;
    const wrapperRef = useRef(null);
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
        const updateScale = () => {
            if (wrapperRef.current) {
                const w = wrapperRef.current.offsetWidth || 561;
                setScale(w / BASE_WIDTH);
            }
        };
        updateScale();
        let observer;
        if (typeof ResizeObserver !== 'undefined' && wrapperRef.current) {
            observer = new ResizeObserver(updateScale);
            observer.observe(wrapperRef.current);
        }
        window.addEventListener('resize', updateScale);
        return () => {
            window.removeEventListener('resize', updateScale);
            if (observer) observer.disconnect();
        };
    }, [template?.layout_style, isFullscreen]);

    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
                <LayoutTemplate className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Select a template to generate preview</p>
            </div>
        );
    }

    // Merge template and form data for easy access
    const combinedData = {
        ...template,
        ...formData,
        primary_color: template.primary_color || "#0284C7",
        secondary_color: template.secondary_color || "#E2E8F0",
        body_font_color: template.body_font_color || "#1E293B",
        font_family: template.font_family || "Lato",
        background_url: template.background_url,
        logo_url: template.logo_url,
        custom_text: template.custom_text || {},
    };

    // Specific field mappings (use undefined when empty so per-template defaults apply identically to backend Jinja2 `or`)
    combinedData.certificateTitle = combinedData.custom_text?.title?.trim() ? combinedData.custom_text.title : undefined;
    combinedData.certificateBody = combinedData.custom_text?.body?.trim() ? combinedData.custom_text.body : undefined;
    combinedData.signature_title = combinedData.custom_text?.signature_title?.trim() ? combinedData.custom_text.signature_title : undefined;
    combinedData.recipient_name = combinedData.recipient_name || "Recipient Name";
    combinedData.course_title = combinedData.course_title || "Course Title";
    combinedData.issue_date = combinedData.issue_date || new Date().toISOString().split('T')[0];
    combinedData.signature = combinedData.signature || "";
    combinedData.issuer_name = combinedData.issuer_name || "Issuer Name";
    combinedData.verification_id = combinedData.verification_id || "PENDING";
    combinedData.verification_url = combinedData.verification_url || (typeof window !== "undefined" ? `${window.location.origin}/verify/${combinedData.verification_id}` : `https://www.proofdeck.app/verify/${combinedData.verification_id}`);
    combinedData.extra_fields = combinedData.extra_fields || {};

    // Determine whether uploaded signature image should be used (default: true if user has one)
    const useUploadedSig =
        combinedData.use_uploaded_signature !== undefined
            ? Boolean(combinedData.use_uploaded_signature)
            : combinedData.extra_fields?.use_uploaded_signature !== undefined
            ? Boolean(combinedData.extra_fields.use_uploaded_signature)
            : true;

    const rawSigUrl =
        combinedData.signature_image_url !== undefined
            ? combinedData.signature_image_url
            : combinedData.signature_image || currentUser?.signature_image_url;

    if (useUploadedSig && rawSigUrl) {
        const cleanBase = (SERVER_BASE_URL || "").replace(/\/+$/, "");
        combinedData.signature_image =
            rawSigUrl.startsWith("http") || rawSigUrl.startsWith("blob:") || rawSigUrl.startsWith("data:")
                ? rawSigUrl
                : `${cleanBase}${rawSigUrl.startsWith("/") ? rawSigUrl : `/${rawSigUrl}`}`;
    } else {
        combinedData.signature_image = null;
    }
    
    // Convert key-value pairs to array for iteration if needed (excluding internal flags)
    combinedData.customFieldsArray = Object.entries(combinedData.extra_fields)
        .filter(([key]) => key !== "use_uploaded_signature")
        .map(([key, value]) => ({ key, value }));

    combinedData.amount = combinedData.amount || combinedData.extra_fields.amount;

    // Prepared styles
    combinedData.textStyle = { color: combinedData.body_font_color };
    if (combinedData.font_family) combinedData.textStyle.fontFamily = combinedData.font_family;

    combinedData.backgroundStyle = {
        backgroundImage: combinedData.background_url
            ? `url(${combinedData.background_url.startsWith("blob:") || combinedData.background_url.startsWith("http") || combinedData.background_url.startsWith("data:") ? combinedData.background_url : `${SERVER_BASE_URL}${combinedData.background_url}`})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
    };

    combinedData.issueDateFormatted = new Date(combinedData.issue_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    // --- VISUAL LAYOUT (CANVA-LIKE) ---
    if (template.layout_style === "visual") {
         return (
             <div className="shadow-lg rounded-lg overflow-hidden h-full bg-white">
                 <KonvaPreview layoutData={template.layout_data} dynamicData={combinedData} />
             </div>
         );
    }

    // --- RENDERER SWITCH (1122x794 Fixed Coordinate Stage for 100% WYSIWYG Parity) ---
    const renderContent = () => {
        switch (template.layout_style) {
            case 'modern': return <Modern data={combinedData} isFullscreen={true} />;
            case 'receipt': return <Receipt data={combinedData} isFullscreen={true} />;
            case 'modern_landscape': return <ModernLandscape data={combinedData} isFullscreen={true} />;
            case 'elegant_serif': return <ElegantSerif data={combinedData} isFullscreen={true} />;
            case 'minimalist_bold': return <MinimalistBold data={combinedData} isFullscreen={true} />;
            case 'corporate_blue': return <CorporateBlue data={combinedData} isFullscreen={true} />;
            case 'tech_dark': return <TechDark data={combinedData} isFullscreen={true} />;
            case 'creative_art': return <CreativeArt data={combinedData} isFullscreen={true} />;
            case 'badge_cert': return <BadgeCert data={combinedData} isFullscreen={true} />;
            case 'award_gold': return <AwardGold data={combinedData} isFullscreen={true} />;
            case 'diploma_classic': return <DiplomaClassic data={combinedData} isFullscreen={true} />;
            case 'achievement_star': return <AchievementStar data={combinedData} isFullscreen={true} />;
            case 'classic': default: return <Classic data={combinedData} isFullscreen={true} />;
        }
    };

    return (
        <div
            ref={wrapperRef}
            className="shadow-lg w-full relative overflow-hidden bg-white"
            style={{
                aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}`,
                height: wrapperRef.current ? `${wrapperRef.current.offsetWidth * (BASE_HEIGHT / BASE_WIDTH)}px` : undefined,
            }}
        >
            <div
                style={{
                    width: `${BASE_WIDTH}px`,
                    height: `${BASE_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default TemplateRenderer;
