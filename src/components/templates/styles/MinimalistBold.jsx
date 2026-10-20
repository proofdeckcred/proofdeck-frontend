import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const MinimalistBold = ({ data }) => {
    const {
        primary_color = '#111827',
        body_font_color = '#111827',
        textStyle,
        backgroundStyle,
        logo_url,
        recipient_name = 'Recipient Name',
        certificateBody = 'has successfully completed the requirements for',
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
                padding: '48px',
                display: 'flex',
                flexDirection: 'row',
                boxSizing: 'border-box',
                fontFamily: data.font_family || "'Montserrat', sans-serif",
                overflow: 'hidden',
                ...backgroundStyle
            }}
        >
            <div
                style={{
                    width: '96px',
                    height: '100%',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    backgroundColor: primary_color,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '24px',
                    boxSizing: 'border-box'
                }}
            >
                <div
                    style={{
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'bottom left',
                        whiteSpace: 'nowrap',
                        opacity: 0.6,
                        position: 'absolute',
                        bottom: '128px',
                        left: '36px',
                        letterSpacing: '0.08em'
                    }}
                >
                    CERTIFICATE ID: {data.verification_id || '000000'}
                </div>
            </div>

            <div
                style={{
                    paddingLeft: '112px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                {resolvedLogo && (
                    <img
                        src={resolvedLogo}
                        alt="Logo"
                        style={{ height: '56px', objectFit: 'contain', marginBottom: '24px', alignSelf: 'flex-start' }}
                    />
                )}
                <h1
                    style={{
                        fontSize: '64px',
                        fontWeight: 900,
                        color: body_font_color,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        margin: '0 0 8px 0'
                    }}
                >
                    CERTIFICATE
                </h1>
                <h2
                    style={{
                        fontSize: '24px',
                        fontWeight: 500,
                        color: '#9ca3af',
                        margin: '0 0 44px 0',
                        letterSpacing: '0.05em'
                    }}
                >
                    OF COMPLETION
                </h2>

                <p
                    style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        margin: '0 0 6px 0'
                    }}
                >
                    Proudly Presented To
                </p>
                <p
                    style={{
                        fontSize: '42px',
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 28px 0',
                        ...textStyle
                    }}
                >
                    {recipient_name}
                </p>

                <p style={{ color: '#4b5563', maxWidth: '640px', margin: '0 0 28px 0', fontSize: '16px', lineHeight: 1.6 }}>
                    {certificateBody}{' '}
                    <span style={{ fontWeight: 700, color: primary_color }}>{course_title}</span> on{' '}
                    {data.issueDateFormatted}.
                </p>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px', maxWidth: '640px' }}>
                        {customFields.map((field, index) => (
                            <div key={index} style={{ display: 'flex', gap: '8px', fontSize: '14px', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px', width: '140px', flexShrink: 0 }}>
                                    {field.key}:
                                </span>
                                <span style={{ fontWeight: 700, color: '#111827' }}>{field.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '48px', marginTop: '12px' }}>
                    <div>
                        <div
                            className="font-signature"
                            style={{
                                height: '48px',
                                width: '160px',
                                borderBottom: '1px solid #d1d5db',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                fontSize: '24px',
                                paddingBottom: '4px'
                            }}
                        >
                            {data.signature_image ? (
                                <img src={data.signature_image} alt="Signature" style={{ height: '38px', objectFit: 'contain' }} />
                            ) : (
                                data.signature || 'Sign'
                            )}
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0 }}>Signature</p>
                    </div>
                    <div>
                        <div
                            style={{
                                height: '48px',
                                width: '160px',
                                borderBottom: '1px solid #d1d5db',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                fontSize: '14px',
                                paddingBottom: '4px',
                                color: '#374151'
                            }}
                        >
                            {data.issueDateFormatted}
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0 }}>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinimalistBold;
