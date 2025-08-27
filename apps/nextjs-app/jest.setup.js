import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
    useUser: () => ({
        user: {
            id: 'test-user-id',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
        isSignedIn: true,
    }),
    useAuth: () => ({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
    }),
    ClerkProvider: ({ children }) => children,
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key'
process.env.CLERK_SECRET_KEY = 'test-secret'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY = 'test-upload-key'

// Mock fetch for IP detection
global.fetch = jest.fn()

// Mock window.postMessage
Object.defineProperty(window, 'postMessage', {
    value: jest.fn(),
    writable: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))
