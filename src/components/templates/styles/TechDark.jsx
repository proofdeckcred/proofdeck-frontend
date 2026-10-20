import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const TechDark = ({ data }) => {
    const {
        primary_color = '#00ff88',
        secondary_color = '#7000ff',
        textStyle,
        backgroundStyle,
        logo_url,
        certificateTitle = 'CERTIFICATE OF ACHIEVEMENT',
        recipient_name = 'Recipient Name',
        certificateBody = 'has successfully mastered the curriculum for',
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
                backgroundColor: '#111827',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'JetBrains Mono', monospace",
                boxSizing: 'border-box',
                ...backgroundStyle
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.2,
                    backgroundImage: `radial-gradient(${primary_color} 1.5px, transparent 1.5px)`,
                    backgroundSize: '24px 24px'
                }}
            ></div>

            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '56px 72px',
                    position: 'relative',
                    zIndex: 10,
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', opacity: 0.85 }}>
                    {resolvedLogo && (
                        <img
                            src={resolvedLogo}
                            style={{ height: '36px', objectFit: 'contain' }}
                            alt="Logo"
                        />
                    )}
                    <span style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.16em', color: '#9ca3af' }}>
                        System Validation // {data.issuer_name || 'Verified'}
                    </span>
                </div>

                <h1 style={{ fontSize: '46px', fontWeight: 700, margin: '0 0 8px 0', color: primary_color }}>
                    {certificateTitle}
                </h1>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '32px', fontFamily: "'JetBrains Mono', monospace" }}>
                    HASH: {data.verification_id || '8f2a9c...1b4'} | DATE: {data.issueDateFormatted}
                </div>

                <p style={{ color: '#d1d5db', margin: '0 0 10px 0', fontSize: '15px' }}>
                    Is hereby granted to:
                </p>
                <div style={{ marginBottom: '28px' }}>
                    <h2
                        style={{
                            fontSize: '36px',
                            fontWeight: 700,
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            display: 'inline-block',
                            padding: '10px 24px',
                            margin: 0,
                            transform: 'skewX(-12deg)',
                            ...textStyle
                        }}
                    >
                        <span style={{ transform: 'skewX(12deg)', display: 'inline-block', color: '#000000' }}>
                            {recipient_name}
                        </span>
                    </h2>
                </div>

                <p style={{ color: '#d1d5db', maxWidth: '680px', margin: '0 0 28px 0', fontSize: '16px', lineHeight: 1.6 }}>
                    {certificateBody} <span style={{ color: primary_color, fontWeight: 700 }}>{course_title}</span>.
                    Skills verified algorithmically.
                </p>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px 48px',
                            maxWidth: '680px',
                            marginBottom: '28px',
                            paddingLeft: '16px',
                            borderLeft: `2px solid ${primary_color}`
                        }}
                    >
                        {customFields.map((field, index) => (
                            <div key={index} style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                    &gt;&gt; {field.key}
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb' }}>
                                    {field.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '9999px',
                                border: `1px solid ${primary_color}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: primary_color,
                                fontWeight: 700
                            }}
                        >
                            AI
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {data.signature_image ? (
                                <img
                                    src={data.signature_image}
                                    alt="Signature"
                                    style={{ height: '34px', objectFit: 'contain', marginBottom: '4px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '4px' }}
                                />
                            ) : (
                                <p style={{ color: '#ffffff', margin: '0 0 2px 0', fontWeight: 700 }}>
                                    {data.signature || 'Verified'}
                                </p>
                            )}
                            <p style={{ margin: 0 }}>{data.signature_title || 'Authorized Signature'}</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '32px', fontWeight: 700, color: secondary_color, margin: '0 0 2px 0' }}>
                            100%
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Score</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechDark;
