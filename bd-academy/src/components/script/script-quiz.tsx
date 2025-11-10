//create react component function

import { FunctionComponent } from 'react'
// export type Quiz = {}

export const ScriptQuizComponent: FunctionComponent = () => {
    // const [quiz, setQuiz] = useState<Quiz[]>([])

    // const onClickUpdate = () => {
    //     console.log('update')
    // }

    return (
        <div className={'flex flex-col gap-[14px] bg-[var(--content)] rounded-[14px] p-[14px]'}>
            EMPTY QUIZ
            {/* <div className={'flex flex-col gap-[14px]'}>
                <label htmlFor="title">Title*</label>
            </div>
            <SecondaryButton label={''} icon={PrimeIcons.UPLOAD} onClick={onClickUpdate}></SecondaryButton> */}
        </div>
    )
}
