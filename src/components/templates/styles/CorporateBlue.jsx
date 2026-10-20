import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const CorporateBlue = ({ data }) => {
    const {
        primary_color = '#0056b3',
        secondary_color = '#00a8e8',
        textStyle,
        backgroundStyle,
        logo_url,
        certificateTitle = 'Certificate of Excellence',
        recipient_name = 'Recipient Name',
        certificateBody = 'This award certifies the successful completion of',
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
                backgroundColor: '#ffffff',
                position: 'relative',
                border: '20px solid #ffffff',
                outline: '1px solid #e5e7eb',
                boxSizing: 'border-box',
                fontFamily: data.font_family || "'Open Sans', sans-serif",
                overflow: 'hidden',
                ...backgroundStyle
            }}
        >
            {/* Top angled banner (WeasyPrint + Browser 1:1 compatible) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '280px',
                    background: `linear-gradient(174deg, ${primary_color} 0%, ${primary_color} 78%, transparent 78.3%)`
                }}
            ></div>
            {/* Bottom-right angled accent */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '540px',
                    height: '200px',
                    opacity: 0.12,
                    background: `linear-gradient(162deg, transparent 0%, transparent 50%, ${secondary_color} 50.3%, ${secondary_color} 100%)`
                }}
            ></div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    padding: '28px 48px',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ marginTop: '8px' }}>
                    {resolvedLogo ? (
                        <img
                            src={resolvedLogo}
                            style={{
                                height: '64px',
                                backgroundColor: '#ffffff',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                objectFit: 'contain'
                            }}
                            alt="Logo"
                        />
                    ) : (
                        <div
                            style={{
                                height: '64px',
                                width: '64px',
                                backgroundColor: '#ffffff',
                                borderRadius: '9999px',
                                margin: '0 auto',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: primary_color,
                                fontWeight: 800,
                                fontSize: '20px'
                            }}
                        >
                            ★
                        </div>
                    )}
                </div>

                <div
                    style={{
                        color: '#111827',
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        padding: '36px 48px',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.10)',
                        border: '1px solid #f3f4f6',
                        width: '78%',
                        boxSizing: 'border-box'
                    }}
                >
                    <h1
                        style={{
                            fontSize: '24px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            fontWeight: 300,
                            color: '#6b7280',
                            margin: '0 0 10px 0'
                        }}
                    >
                        {certificateTitle}
                    </h1>
                    <h2
                        style={{
                            fontSize: '40px',
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 20px 0',
                            ...textStyle
                        }}
                    >
                        {recipient_name}
                    </h2>
                    <div
                        style={{
                            width: '64px',
                            height: '4px',
                            margin: '0 auto 20px auto',
                            backgroundColor: primary_color
                        }}
                    ></div>
                    <p style={{ color: '#4b5563', margin: 0, fontSize: '16px' }}>
                        {certificateBody}
                    </p>
                    <h3
                        style={{
                            fontSize: '26px',
                            fontWeight: 700,
                            margin: '10px 0 6px 0',
                            color: primary_color
                        }}
                    >
                        {course_title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>
                        Given on this day {data.issueDateFormatted}
                    </p>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: '28px',
                                width: '100%',
                                padding: '8px 24px 0 24px',
                                boxSizing: 'border-box'
                            }}
                        >
                            {customFields.map((field, index) => (
                                <div key={index} style={{ textAlign: 'center', minWidth: '140px' }}>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: '#9ca3af',
                                            display: 'block',
                                            letterSpacing: '0.06em',
                                            marginBottom: '2px'
                                        }}
                                    >
                                        {field.key}
                                    </span>
                                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
                                        {field.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        color: '#111827',
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        padding: '0 64px 8px 64px',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ textAlign: 'center', minWidth: '180px' }}>
                        <div style={{ minHeight: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                            {data.signature_image ? (
                                <img
                                    src={data.signature_image}
                                    alt="Signature"
                                    style={{ height: '38px', objectFit: 'contain', margin: '0 auto' }}
                                />
                            ) : (
                                <p className="font-script" style={{ fontSize: '26px', margin: 0 }}>
                                    {data.signature || 'Jane Doe'}
                                </p>
                            )}
                        </div>
                        <div style={{ height: '1px', width: '160px', backgroundColor: '#d1d5db', margin: '0 auto' }}></div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', marginTop: '6px', marginBottom: 0, color: '#9ca3af', letterSpacing: '0.06em' }}>
                            {data.signature_title || 'Instructor'}
                        </p>
                    </div>

                    {data.verification_id && (
                        <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                            ID: {data.verification_id}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', minWidth: '180px' }}>
                        <div style={{ minHeight: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                            <p className="font-script" style={{ fontSize: '24px', margin: 0, color: '#374151' }}>
                                {data.issuer_name || 'Director'}
                            </p>
                        </div>
                        <div style={{ height: '1px', width: '160px', backgroundColor: '#d1d5db', margin: '0 auto' }}></div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', marginTop: '6px', marginBottom: 0, color: '#9ca3af', letterSpacing: '0.06em' }}>
                            Issuing Authority
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateBlue;
