import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Thibaut Sainrat - Portfolio';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            // Background with radial pattern
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                    padding: '80px',
                    fontFamily: 'sans-serif',
                    color: 'white',
                }}
            >
                {/* Top Left - Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                    }}
                >
                    <span
                        style={{
                            color: 'black',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                        }}
                    >
                        TS
                    </span>
                </div>

                {/* Center - Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flexGrow: 1,
                    }}
                >
                    <h1
                        style={{
                            fontSize: '72px',
                            fontWeight: 'bold',
                            margin: '0 0 20px 0',
                        }}
                    >
                        Thibaut Sainrat
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span
                            style={{
                                fontSize: '36px',
                                color: '#60a5fa',
                            }}
                        >
                            Head of Product
                        </span>

                        <span style={{ fontSize: '36px', color: '#475569' }}>/</span>

                        <div
                            style={{
                                display: 'flex',
                                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                padding: '4px 12px',
                                borderRadius: '4px',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '36px',
                                    color: '#4ade80',
                                    fontFamily: 'monospace',
                                }}
                            >
                                &lt;AI Builder /&gt;
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom - Footer */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '1px',
                            backgroundColor: '#334155',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '24px',
                                color: '#94a3b8',
                            }}
                        >
                            GenAI Strategy • RAG • Product Management
                        </span>
                        <span
                            style={{
                                fontSize: '24px',
                                color: '#94a3b8',
                                fontFamily: 'monospace',
                            }}
                        >
                            thibautsainrat.fr
                        </span>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
