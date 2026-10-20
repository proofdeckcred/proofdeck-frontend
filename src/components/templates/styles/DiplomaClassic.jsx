import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const DiplomaClassic = ({ data }) => {
    const {
        backgroundStyle,
        logo_url,
        textStyle,
        certificateTitle = 'Diploma',
        recipient_name = 'Recipient Name',
        certificateBody = 'Has completed the prescribed course of study in',
        course_title = 'Course Title'
    } = data;

    const resolvedLogo = logo_url
        ? (logo_url.startsWith('blob:') || logo_url.startsWith('data:') || logo_url.startsWith('http')
            ? logo_url
            : `${SERVER_BASE_URL}${logo_url}`)
        : null;

    const customFields = (data.customFieldsArray || []).filter(f => f.key !== 'amount');

    return (
        <div
            style={{
                width: '1122px',
                height: '794px',
                backgroundColor: '#fdfbf7',
                position: 'relative',
                padding: '56px 72px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: data.font_family || 'Georgia, serif',
                overflow: 'hidden',
                ...backgroundStyle
            }}
        >
            <div style={{ position: 'absolute', top: '16px', right: '16px', bottom: '16px', left: '16px', border: '3px solid #000000', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: '24px', right: '24px', bottom: '24px', left: '24px', border: '1px solid #000000', pointerEvents: 'none' }}></div>

            <div style={{ marginTop: '8px' }}>
                {resolvedLogo && (
                    <img src={resolvedLogo} style={{ height: '72px', objectFit: 'contain', margin: '0 auto 14px auto', display: 'block' }} alt="Logo" />
                )}
                <h1 style={{ fontSize: '44px', fontWeight: 900, textTransform: 'uppercase', color: '#111827', letterSpacing: '0.08em', fontFamily: 'Georgia, serif', margin: 0 }}>
                    {certificateTitle}
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5em', marginTop: '8px', marginBottom: 0 }}>
                    Of Graduation
                </p>
            </div>

            <div style={{ margin: '12px 0', width: '100%' }}>
                <p style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#4b5563', fontSize: '18px', margin: '0 0 14px 0' }}>
                    This is to certify that
                </p>
                <h2
                    style={{
                        ...textStyle,
                        fontSize: '42px',
                        fontFamily: 'Georgia, serif',
                        fontWeight: 700,
                        color: data.body_font_color || '#000000',
                        borderBottom: '1px solid #000000',
                        display: 'inline-block',
                        padding: '0 48px 8px 48px',
                        margin: '0 0 24px 0'
                    }}
                >
                    {recipient_name}
                </h2>
                <p style={{ fontFamily: 'Georgia, serif', color: '#1f2937', fontSize: '20px', margin: 0, lineHeight: 1.5 }}>
                    {certificateBody}
                    <strong style={{ fontSize: '26px', marginTop: '10px', display: 'block', color: '#000000' }}>
                        {course_title}
                    </strong>
                </p>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            maxWidth: '520px',
                            margin: '20px auto 0 auto',
                            textAlign: 'left',
                            borderTop: '1px solid #d1d5db',
                            paddingTop: '14px'
                        }}
                    >
                        {customFields.map((field, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Georgia, serif', fontSize: '14px' }}>
                                <span style={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{field.key}</span>
                                <span style={{ fontWeight: 700, color: '#111827' }}>{field.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px' }}>
                    <div style={{ minHeight: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                        {data.signature_image ? (
                            <img src={data.signature_image} alt="Signature" style={{ height: '38px', objectFit: 'contain' }} />
                        ) : (
                            <span className="font-signature" style={{ fontSize: '24px', color: '#111827' }}>
                                {data.signature || 'Principal'}
                            </span>
                        )}
                    </div>
                    <div style={{ height: '1px', width: '180px', backgroundColor: '#000000', marginBottom: '8px' }}></div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, margin: 0, color: '#111827' }}>
                        {data.signature_title || 'Principal'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '96px', height: '96px', position: 'relative' }}>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(202, 138, 4, 0.14)',
                                border: '4px solid #ca8a04',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#854d0e',
                                fontSize: '11px',
                                fontWeight: 700,
                                textAlign: 'center',
                                padding: '8px',
                                textTransform: 'uppercase',
                                boxSizing: 'border-box',
                                lineHeight: 1.3
                            }}
                        >
                            <span>Official<br />Seal</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px' }}>
                    <div style={{ minHeight: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#374151', fontStyle: 'italic' }}>
                            {data.issueDateFormatted}
                        </span>
                    </div>
                    <div style={{ height: '1px', width: '180px', backgroundColor: '#000000', marginBottom: '8px' }}></div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, margin: 0, color: '#111827' }}>
                        Date Conferred
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DiplomaClassic;
