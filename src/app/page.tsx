import Link from "next/link";
import { AuthButton, AuthLayout } from "./components/AuthComponents";

export default function Home() {
  return (
    <AuthLayout>
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl 
                    space-y-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome to WeeklyBlog
        </h1>
        <div className="space-y-4">
          <p className="text-gray-600">
            WeeklyBlog is a platform where you can share your thoughts and ideas
            with the world. Join us today and start blogging!
          </p>
          <Link href="/blogPage" className="block">
            <AuthButton className="bg-gray-500 text-white hover:bg-gray-600">
              Browse
            </AuthButton>
          </Link>
          <p className="text-xs text-gray-500">Called it weekly blog cause i wanted to delete posts everyweek, 
            might still do that if im not lazy
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
