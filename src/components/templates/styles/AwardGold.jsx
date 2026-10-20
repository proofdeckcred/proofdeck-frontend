import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const AwardGold = ({ data }) => {
    const {
        backgroundStyle,
        textStyle,
        logo_url,
        certificateTitle = 'Achievement Award',
        recipient_name = 'Recipient Name',
        certificateBody = 'Has successfully met all the criteria required for the completion of',
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
                backgroundImage: 'radial-gradient(circle, #fffff0 0%, #ffffff 100%)',
                position: 'relative',
                border: '24px solid #c0a062',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 64px',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: data.font_family || 'Georgia, serif',
                overflow: 'hidden',
                ...backgroundStyle
            }}
        >
            <div style={{ position: 'absolute', top: '8px', right: '8px', bottom: '8px', left: '8px', border: '1px solid rgba(192, 160, 98, 0.5)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: '16px', right: '16px', bottom: '16px', left: '16px', border: '1px solid rgba(192, 160, 98, 0.3)', pointerEvents: 'none' }}></div>

            {resolvedLogo ? (
                <img src={resolvedLogo} alt="Logo" style={{ height: '64px', objectFit: 'contain', marginBottom: '16px' }} />
            ) : (
                <div style={{ width: '64px', height: '64px', marginBottom: '16px', color: '#c0a062' }}>
                    <svg fill="currentColor" viewBox="0 0 24 24" width="64" height="64">
                        <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                    </svg>
                </div>
            )}

            <h1 style={{ fontSize: '40px', fontFamily: 'Georgia, serif', textTransform: 'uppercase', color: '#c0a062', margin: '0 0 8px 0', letterSpacing: '0.12em', fontWeight: 700 }}>
                {certificateTitle}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4em', margin: '0 0 28px 0' }}>
                Highest Honor
            </p>

            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '18px', color: '#6b7280', margin: '0 0 8px 0' }}>
                This certifies that
            </p>
            <h2
                className="font-script"
                style={{
                    fontSize: '54px',
                    color: '#000000',
                    margin: '0 0 20px 0',
                    fontWeight: 400,
                    ...textStyle
                }}
            >
                {recipient_name}
            </h2>

            <p style={{ maxWidth: '520px', margin: '0 auto 24px auto', color: '#4b5563', fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: 1.6 }}>
                {certificateBody}
                <span style={{ display: 'block', fontWeight: 700, fontSize: '22px', marginTop: '10px', color: '#000000' }}>
                    {course_title}
                </span>
            </p>

            {/* Custom Fields */}
            {customFields.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', width: '100%', maxWidth: '480px', padding: '0 32px', boxSizing: 'border-box' }}>
                    {customFields.map((field, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(192, 160, 98, 0.3)', paddingBottom: '4px', fontSize: '14px' }}>
                            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6b7280' }}>{field.key}</span>
                            <span style={{ fontWeight: 700, color: '#1f2937' }}>{field.value}</span>
                        </div>
                    ))}
                </div>
            )}

            <div
                style={{
                    width: '100%',
                    maxWidth: '640px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    padding: '20px 32px 0 32px',
                    borderTop: '1px solid rgba(192, 160, 98, 0.3)',
                    boxSizing: 'border-box',
                    marginTop: 'auto'
                }}
            >
                <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px 0' }}>Date</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{data.issueDateFormatted}</p>
                </div>

                {data.verification_id && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                        ID: {data.verification_id}
                    </div>
                )}

                <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px 0' }}>
                        {data.signature_title || 'Signature'}
                    </p>
                    {data.signature_image ? (
                        <img src={data.signature_image} alt="Signature" style={{ height: '36px', objectFit: 'contain', margin: '2px auto 0 auto', display: 'block' }} />
                    ) : (
                        <p className="font-script" style={{ fontSize: '22px', color: '#6b7280', margin: 0 }}>
                            {data.signature || 'Authorized'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AwardGold;
