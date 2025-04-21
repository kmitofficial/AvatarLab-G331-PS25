import { ToastContainer } from "react-toastify";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-200">
            <ToastContainer/>
            <div className="flex flex-col min-h-screen max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <main className="flex flex-1 items-center justify-center py-12">
                    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 space-y-6">
                            <h1 className="text-4xl font-bold text-gray-900">
                                Create, and Personalize
                            </h1>
                            <h2 className="text-3xl font-semibold text-blue-600">
                                Videos in Minutes
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Create stunning videos with ease. Create your own or choose from our library of AI avatars and voices
                            </p>
                        </div>
                        <div className="lg:col-span-7">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}