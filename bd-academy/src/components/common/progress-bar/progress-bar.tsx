import { FC, useEffect, useState } from 'react'
import './progress-bar.css'
export const ProgressBar: FC<any> = ({ progressValue }) => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        setProgress(parseFloat(progressValue.toFixed(2)) * 100)
    }, [progressValue])

    return (
        <>
            {progressValue > 0 && progressValue < 1 ? (
                <div className="progressBar-container--abs" onClick={(e) => e.stopPropagation()}>
                    <div className="progress-bar">
                        <svg className="progress-circle" width="110px" height="110px" xmlns="http://www.w3.org/2000/svg">
                            <circle className="progress-circle-back" cx="55" cy="55" r="50"></circle>
                            <circle
                                className="progress-circle-prog progress-circle-prog-transition"
                                style={{ '--value': progress } as any}
                                cx="55"
                                cy="55"
                                r="50"
                            ></circle>
                        </svg>
                        <div className="progress-text">{progress.toFixed()} %</div>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </>
    )
}
