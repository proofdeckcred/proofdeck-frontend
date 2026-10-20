import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const BadgeCert = ({ data }) => {
    const {
        certificateTitle = 'CERTIFICATE OF EXCELLENCE',
        backgroundStyle,
        logo_url,
        textStyle,
        recipient_name = 'Recipient Name',
        certificateBody = 'has demonstrated exceptional mastery in',
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
                backgroundColor: '#f8fafc',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '44px',
                boxSizing: 'border-box',
                fontFamily: data.font_family || "'Open Sans', sans-serif",
                overflow: 'hidden',
                ...backgroundStyle
            }}
        >
            {/* Left Dark Slate Badge Column */}
            <div
                style={{
                    width: '340px',
                    height: '100%',
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    padding: '32px',
                    marginRight: '44px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '8px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)'
                    }}
                ></div>

                <div
                    style={{
                        width: '112px',
                        height: '112px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        border: '4px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                    </svg>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {certificateTitle}
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', margin: 0 }}>
                    Top Performer
                </p>

                {data.verification_id && (
                    <div style={{ position: 'absolute', bottom: '20px', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                        ID: {data.verification_id}
                    </div>
                )}
            </div>

            {/* Right Main Content Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.06em' }}>
                            Awarded To
                        </p>
                        <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a', margin: 0, ...textStyle }}>
                            {recipient_name}
                        </h1>
                    </div>
                    {resolvedLogo && (
                        <img src={resolvedLogo} style={{ height: '56px', objectFit: 'contain' }} alt="Logo" />
                    )}
                </div>

                <p
                    style={{
                        color: '#475569',
                        marginBottom: '28px',
                        borderLeft: '4px solid #e2e8f0',
                        paddingLeft: '20px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        fontSize: '17px',
                        lineHeight: 1.6,
                        marginTop: 0
                    }}
                >
                    {certificateBody} <strong style={{ color: '#0f172a' }}>{course_title}</strong>. Recognized for outstanding dedication and skill.
                </p>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                        {customFields.map((field, index) => (
                            <div key={index} style={{ display: 'flex', gap: '12px', fontSize: '14px', paddingLeft: '20px' }}>
                                <span style={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', width: '140px', flexShrink: 0 }}>
                                    {field.key}:
                                </span>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{field.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        backgroundColor: '#ffffff',
                        padding: '20px 28px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '12px'
                    }}
                >
                    <div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>
                            Date Awarded
                        </p>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: 0 }}>
                            {data.issueDateFormatted}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>
                            {data.signature_title || 'Signature'}
                        </p>
                        {data.signature_image ? (
                            <img
                                src={data.signature_image}
                                alt="Signature"
                                style={{ height: '36px', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginTop: '2px' }}
                            />
                        ) : (
                            <p className="font-script" style={{ fontSize: '22px', color: '#334155', margin: 0 }}>
                                {data.signature || 'Manager'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeCert;
