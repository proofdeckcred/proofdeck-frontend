import React from 'react';
import KonvaPreview from '../KonvaPreview'; // Adjust path as needed
import { LayoutTemplate } from 'lucide-react';
import { SERVER_BASE_URL } from '../../config';

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


const TemplateRenderer = ({ template, formData = {}, isFullscreen = false }) => {
    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
                <LayoutTemplate className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Select a template to generate preview</p>
            </div>
        );
    }

    // Merge template and form data for easy access
    // Note: formData usually overrides template defaults
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

    // Specific field mappings
    combinedData.certificateTitle = combinedData.custom_text?.title || "Certificate of Completion";
    combinedData.certificateBody = combinedData.custom_text?.body || "has successfully completed the course";
    combinedData.recipient_name = combinedData.recipient_name || "Recipient Name";
    combinedData.course_title = combinedData.course_title || "Course Title";
    combinedData.issue_date = combinedData.issue_date || new Date().toISOString().split('T')[0];
    combinedData.signature = combinedData.signature || "Signature";
    combinedData.issuer_name = combinedData.issuer_name || "Issuer Name";
    combinedData.verification_id = combinedData.verification_id || "pending-id";
    combinedData.extra_fields = combinedData.extra_fields || {};
    
    // Convert key-value pairs to array for iteration if needed
    combinedData.customFieldsArray = Object.entries(combinedData.extra_fields).map(([key, value]) => ({ key, value }));

    combinedData.amount = combinedData.amount || combinedData.extra_fields.amount;


    // Prepared styles
    combinedData.textStyle = { color: combinedData.body_font_color };
    if(combinedData.font_family) combinedData.textStyle.fontFamily = combinedData.font_family;

    combinedData.backgroundStyle = {
        backgroundImage: combinedData.background_url
            ? `url(${combinedData.background_url.startsWith("blob:") ? combinedData.background_url : `${SERVER_BASE_URL}${combinedData.background_url}`})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
    };

    combinedData.issueDateFormatted = new Date(combinedData.issue_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    // Container style for scaling
    const containerStyle = {
        aspectRatio: "1.414 / 1",
        width: "100%",
        transform: isFullscreen ? "scale(1)" : "scale(1)",
        transition: "transform 0.3s ease",
        position: "relative",
        overflow: "hidden",
    };

    // --- VISUAL LAYOUT (CANVA-LIKE) ---
    if (template.layout_style === "visual") {
         return (
             <div className="shadow-lg rounded-lg overflow-hidden h-full bg-white">
                 <KonvaPreview layoutData={template.layout_data} dynamicData={combinedData} />
             </div>
         );
    }

    // --- RENDERER SWITCH ---
    const renderContent = () => {
        switch (template.layout_style) {
            case 'modern': return <Modern data={combinedData} isFullscreen={isFullscreen} />;
            case 'receipt': return <Receipt data={combinedData} isFullscreen={isFullscreen} />;
            case 'modern_landscape': return <ModernLandscape data={combinedData} />;
            case 'elegant_serif': return <ElegantSerif data={combinedData} />;
            case 'minimalist_bold': return <MinimalistBold data={combinedData} />;
            case 'corporate_blue': return <CorporateBlue data={combinedData} />;
            case 'tech_dark': return <TechDark data={combinedData} />;
            case 'creative_art': return <CreativeArt data={combinedData} />;
            case 'badge_cert': return <BadgeCert data={combinedData} />;
            case 'award_gold': return <AwardGold data={combinedData} />;
            case 'diploma_classic': return <DiplomaClassic data={combinedData} />;
            case 'achievement_star': return <AchievementStar data={combinedData} />;
            case 'classic': default: return <Classic data={combinedData} isFullscreen={isFullscreen} />;
        }
    };

    if (template.layout_style === 'receipt' || template.layout_style === 'elegant_serif') {
         // Some templates manage their own container or aspect ratio
         return renderContent();
    }

    return (
        <div style={containerStyle} className="shadow-lg">
            {renderContent()}
        </div>
    );
};

export default TemplateRenderer;
