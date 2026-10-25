import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const ElegantSerif = ({ data }) => {
    const {
        primary_color = '#4a3b32',
        secondary_color = '#c5a880',
        textStyle,
        backgroundStyle,
        logo_url,
        certificateTitle = 'Certificate of Achievement',
        recipient_name = 'Recipient Name',
        certificateBody = 'For the successful completion of the curriculum and requirements for:',
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
                backgroundColor: '#FAFAFA',
                position: 'relative',
                padding: '48px 64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: `16px double ${primary_color}`,
                boxSizing: 'border-box',
                fontFamily: data.font_family || 'Georgia, serif',
                overflow: 'hidden',
                ...backgroundStyle
            }}
        >
            {resolvedLogo && (
                <img
                    src={resolvedLogo}
                    alt="Logo"
                    style={{ height: '72px', objectFit: 'contain', marginBottom: '20px', opacity: 0.85 }}
                />
            )}
            <h1 style={{ fontSize: '34px', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 10px 0', color: '#1f2937', fontWeight: 700 }}>
                {certificateTitle}
            </h1>
            <div style={{ width: '64px', height: '1px', backgroundColor: '#d1d5db', marginBottom: '32px' }}></div>

            <p style={{ color: '#6b7280', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '18px', margin: '0 0 12px 0' }}>
                Presented to
            </p>
            <h2
                style={{
                    fontSize: '42px',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    color: data.body_font_color || '#111827',
                    margin: '0 0 24px 0',
                    borderBottom: `2px solid ${secondary_color}`,
                    padding: '0 32px 12px 32px',
                    display: 'inline-block',
                    ...textStyle
                }}
            >
                {recipient_name}
            </h2>

            <p style={{ color: '#4b5563', fontFamily: 'Georgia, serif', lineHeight: 1.6, maxWidth: '560px', margin: '0 0 24px 0', fontSize: '16px' }}>
                {certificateBody}
                <span
                    style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'block',
                        marginTop: '14px',
                        color: primary_color
                    }}
                >
                    {course_title}
                </span>
            </p>

            {/* Custom Fields */}
            {customFields.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginBottom: '20px', maxWidth: '640px' }}>
                    {customFields.map((field, index) => (
                        <div key={index} style={{ textAlign: 'center', fontFamily: 'Georgia, serif' }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                                {field.key}
                            </span>
                            <span style={{ fontSize: '16px', color: '#1f2937', fontStyle: 'italic', borderBottom: '1px solid #e5e7eb', padding: '0 16px 4px 16px', display: 'inline-block' }}>
                                {field.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 24px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '84px',
                            height: '84px',
                            borderRadius: '9999px',
                            border: `2px dashed ${secondary_color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '9999px',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                fontWeight: 700,
                                textAlign: 'center',
                                color: '#4b5563',
                                lineHeight: 1.2
                            }}
                        >
                            <span>OFFICIAL<br />SEAL</span>
                        </div>
                    </div>
                    {data.issueDateFormatted && (
                        <span style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginTop: '6px' }}>
                            {data.issueDateFormatted}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        className="font-signature"
                        style={{
                            width: '200px',
                            borderBottom: '1px solid #1f2937',
                            marginBottom: '8px',
                            textAlign: 'center',
                            fontSize: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            paddingBottom: '4px',
                            minHeight: '44px'
                        }}
                    >
                        {data.signature_image ? (
                            <img src={data.signature_image} alt="Signature" style={{ height: '38px', objectFit: 'contain' }} />
                        ) : (
                            data.signature || 'Director'
                        )}
                    </div>
                    <p style={{ fontSize: '12px', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, color: '#374151' }}>
                        {data.signature_title || 'Director Signature'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ElegantSerif;
