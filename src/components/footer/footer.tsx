import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="my-8 py-4 border-t">
      <div className="mx-auto flex flex-row items-center justify-between text-xs px-4">
        <p className="text-gray-600">
          © {currentYear} silverbirder. All rights reserved.
        </p>
        <Link
          href="https://forms.gle/zKPoqxFs1kvGBKmb6"
          target="_blank"
          prefetch={false}
        >
          Contact Us
        </Link>
      </div>
    </footer>
  );
};
