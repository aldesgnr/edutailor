import { FunctionComponent, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/common/app-layout/app-layout'
import { AuthLayout } from '../components/common/auth-layout/auth-layout'
import { TrainingComponent } from '../components/training/training.component'
import { EditorProvider } from '../contexts/editor-context'
import { NotificationProvider } from '../contexts/notification-context'
import { ComponentsPage } from '../pages/components/components.page'
import { DashboardPage } from '../pages/dashboard/dashboard.page'
import { DialogPage } from '../pages/dialog/dialog.page'
import { DraftsPage } from '../pages/drafts/drafts.page'
import { EditorPage } from '../pages/editor/editor.page'
import { FavoritePage } from '../pages/favorite/favorite.page'
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password.page'
import { HelpPage } from '../pages/help/help.page'
import { LoginPage } from '../pages/login/login.page'
import { NewPasswordPage } from '../pages/new-password/new-password.page'
import { RegisterPage } from '../pages/register/register.page'
import { SettingsAccountPage } from '../pages/settings/settings-account.page'
import { SettingsGlobalPage } from '../pages/settings/settings-global.page'
import { SettingsPage } from '../pages/settings/settings.page'
import { TrainingPage } from '../pages/training/training.page'
import { ViewerPage } from '../pages/viewer/viewer.page'
import { loginManager } from '../services/login-manager.service'
import { ProtectedRoute, UnProtectedRoute } from './protected-route'
import { appConfig } from '../app.config'
import { TrainingProvider } from '../contexts/training-context'

export const AppRouter: FunctionComponent = () => {
    const [isLoginManagerInited, setIsLoginManagerInited] = useState<boolean>(false)

    useEffect(() => {
        const inited$ = loginManager.inited.subscribe((value) => setIsLoginManagerInited(value))
        return () => {
            inited$.unsubscribe()
        }
    }, [])
    useEffect(() => {}, [isLoginManagerInited])
    const basePath = appConfig().BASE_URL ? `${appConfig().BASE_URL}` : '/'
    return (
        <Suspense fallback={'Loading...'}>
            <BrowserRouter basename={basePath}>
                <NotificationProvider>
                    <TrainingProvider>
                        <EditorProvider>
                            <Routes>
                                <Route element={<UnProtectedRoute />}>
                                    <Route element={<AuthLayout />}>
                                        <Route path="/auth/login" element={<LoginPage />} />
                                        <Route path="/auth/register" element={<RegisterPage />} />
                                        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                                        <Route path="/auth/new-password" element={<NewPasswordPage />} />
                                    </Route>
                                </Route>
                                <Route element={<ProtectedRoute />}>
                                    <Route element={<AppLayout />}>
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        <Route path="/favorite" element={<FavoritePage />} />
                                        <Route path="/drafts" element={<DraftsPage />} />
                                        <Route path="/trainings" element={<TrainingPage />} />
                                        <Route path="/trainings/edit" element={<TrainingComponent />} />
                                        <Route path="/trainings/new" element={<TrainingComponent />} />

                                        <Route path="/components" element={<ComponentsPage />} />
                                        <Route path="/help" element={<HelpPage />} />
                                        <Route path="/settings" element={<SettingsPage />}>
                                            <Route path="global" element={<SettingsGlobalPage />} />
                                            <Route path="account" element={<SettingsAccountPage />} />
                                        </Route>
                                        <Route path="/editor" element={<EditorPage />} />
                                        <Route path="/dialog" element={<DialogPage />} />
                                    </Route>
                                </Route>
                                <Route path="/" element={<Navigate replace to="/auth/login" />} />
                                <Route path="/viewer" element={<ViewerPage />} />
                                <Route path="*" element={<Navigate replace to="/dashboard" />} />
                            </Routes>
                        </EditorProvider>
                    </TrainingProvider>
                </NotificationProvider>
            </BrowserRouter>
        </Suspense>
    )
}
