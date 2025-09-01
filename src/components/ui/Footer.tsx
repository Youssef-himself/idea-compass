'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/about" className="text-gray-400 hover:text-gray-500">About</Link>
          <Link href="/privacy" className="text-gray-400 hover:text-gray-500">Privacy</Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-500">Terms</Link>
          <Link href="/contact" className="text-gray-400 hover:text-gray-500">Contact</Link>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} IdeaCompass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}