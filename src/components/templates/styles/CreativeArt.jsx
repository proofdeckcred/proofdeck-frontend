import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const CreativeArt = ({ data }) => {
    const {
        primary_color = '#ff6b6b',
        secondary_color = '#4ecdc4',
        textStyle,
        backgroundStyle,
        logo_url,
        certificateTitle = 'Certificate',
        recipient_name = 'Recipient Name',
        certificateBody = 'For artistic excellence in',
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
                backgroundColor: '#fffbf0',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: data.font_family || "'Lato', sans-serif",
                ...backgroundStyle
            }}
        >
            {/* Soft artistic radial color blobs (100% compatible with both Browser and WeasyPrint) */}
            <div
                style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '380px',
                    height: '380px',
                    borderRadius: '9999px',
                    opacity: 0.55,
                    background: `radial-gradient(circle, ${primary_color} 0%, transparent 70%)`
                }}
            ></div>
            <div
                style={{
                    position: 'absolute',
                    bottom: '-100px',
                    left: '-100px',
                    width: '380px',
                    height: '380px',
                    borderRadius: '9999px',
                    opacity: 0.55,
                    background: `radial-gradient(circle, ${secondary_color} 0%, transparent 70%)`
                }}
            ></div>

            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    padding: '40px 64px',
                    boxSizing: 'border-box'
                }}
            >
                <h1
                    style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontStyle: 'italic',
                        fontSize: '64px',
                        color: primary_color,
                        margin: '0 0 24px 0',
                        opacity: 0.9
                    }}
                >
                    {certificateTitle}
                </h1>

                <div
                    style={{
                        border: '1.5px solid #111827',
                        padding: '44px 64px',
                        backgroundColor: 'rgba(255, 255, 255, 0.82)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                        minWidth: '580px',
                        maxWidth: '760px',
                        boxSizing: 'border-box'
                    }}
                >
                    <p
                        style={{
                            textTransform: 'uppercase',
                            fontSize: '12px',
                            letterSpacing: '0.3em',
                            color: '#6b7280',
                            margin: '0 0 16px 0'
                        }}
                    >
                        Presented To
                    </p>
                    <h2
                        style={{
                            fontSize: '38px',
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 12px 0',
                            ...textStyle
                        }}
                    >
                        {recipient_name}
                    </h2>
                    <div
                        style={{
                            width: '48px',
                            height: '4px',
                            backgroundColor: '#111827',
                            margin: '0 auto 16px auto'
                        }}
                    ></div>
                    <p style={{ color: '#4b5563', fontStyle: 'italic', margin: 0, fontSize: '16px' }}>
                        {certificateBody}
                    </p>
                    <h3
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            margin: '8px 0 20px 0',
                            color: '#1f2937'
                        }}
                    >
                        {course_title}
                    </h3>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', width: '100%', padding: '0 32px', boxSizing: 'border-box' }}>
                            {customFields.map((field, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                                    <span style={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {field.key}
                                    </span>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>
                                        {field.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', margin: 0 }}>
                                {data.issueDateFormatted}
                            </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            {data.signature_image ? (
                                <img
                                    src={data.signature_image}
                                    alt="Signature"
                                    style={{ height: '32px', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginBottom: '2px' }}
                                />
                            ) : (
                                data.signature && (
                                    <p className="font-signature" style={{ fontSize: '20px', margin: '0 0 2px 0', color: '#111827' }}>
                                        {data.signature}
                                    </p>
                                )
                            )}
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>
                                {data.signature_title || 'Authorized Signature'}
                            </span>
                        </div>
                    </div>
                </div>

                {resolvedLogo && (
                    <div style={{ marginTop: '24px', opacity: 0.7 }}>
                        <img src={resolvedLogo} style={{ height: '42px', objectFit: 'contain' }} alt="Logo" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeArt;
