import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="my-8 w-full border-t py-4">
      <div className="mx-auto flex flex-row items-center justify-between px-4 text-xs">
        <p className="text-gray-600">
          © {currentYear} silverbirder. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="https://forms.gle/zKPoqxFs1kvGBKmb6"
            target="_blank"
            prefetch={false}
          >
            Contact Us
          </Link>
          <Link
            href="https://sites.google.com/view/silverbirders-services"
            target="_blank"
            prefetch={false}
          >
            My Services
          </Link>
        </nav>
      </div>
    </footer>
  );
};
