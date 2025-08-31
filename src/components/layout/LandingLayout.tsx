import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Menu, X, Facebook, TwitterIcon, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { useWhitelabel } from "@/hooks/useWhitelabel"
import { normalizeLink } from "@/utils"

const NAV_LINKS = [
	{ to: "#features", label: "nav_features" },
	{ to: "#testimonials", label: "nav_testimonials" },
	{ to: "#pricing", label: "nav_pricing" },
	{ to: "#faq", label: "nav_faq" },
]

const FOOTER_SECTIONS = [
	{
		title: "footer_product",
		links: [
			{ to: "#features", label: "nav_features" },
			{ to: "#pricing", label: "nav_pricing" },
			{ to: "#", label: "footer_integrations" },
			{ to: "#", label: "footer_api" },
		],
	},
	{
		title: "footer_resources",
		links: [
			{ to: "#", label: "footer_documentation" },
			{ to: "#", label: "footer_guides" },
			{ to: "#", label: "footer_blog" },
			{ to: "#", label: "footer_support" },
		],
	},
	{
		title: "footer_company",
		links: [
			{ to: "#", label: "footer_about" },
			{ to: "#", label: "footer_careers" },
			{ to: "#", label: "footer_privacy_policy" },
			{ to: "#", label: "footer_terms_of_service" },
		],
	},
]

const SOCIALS = [
	{
		name: "Facebook",
		icon: Facebook,
	},
	{
		name: "Twitter",
		icon: TwitterIcon,
	},
	{
		name: "LinkedIn",
		icon: Linkedin,
	},
]

const FOOTER_BOTTOM_LINKS = [
	{ to: "#", label: "footer_privacy_policy" },
	{ to: "#", label: "footer_terms_of_service" },
	{ to: "#", label: "footer_cookie_policy" },
]

export function LandingLayout() {
	const { t } = useTranslation("landing")
	const { name: brandName, logo_path } = useWhitelabel()

	const [isScrolled, setIsScrolled] = useState(false)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()

	const scrollToTop = (e: React.MouseEvent) => {
		e.preventDefault()
		if (location.pathname === "/") {
			window.history.replaceState(null, "", window.location.pathname + window.location.search)
			window.scrollTo({ top: 0, behavior: "smooth" })
		} else {
			navigate("/")
		}
	}

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	useEffect(() => {
		if (location.hash) {
			const el = document.getElementById(location.hash.replace("#", ""))
			if (el) {
				el.scrollIntoView({ behavior: "smooth" })
			}
		}
	}, [location.hash])

	return (
		<div className="flex min-h-[100dvh] flex-col">
			<header
				className={`border-b border-b-sidebar-border sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
					isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
				}`}
			>
				<div className="container flex h-16 items-center justify-between">
					<Link
						to="/"
						onClick={scrollToTop}
						className="flex items-center gap-2 font-bold"
						style={{ textDecoration: "none" }}
					>
						<img
							src={logo_path}
							alt={`${brandName} logo`}
							className="h-7 object-contain "
						/>
					</Link>
					<nav className="hidden md:flex gap-8">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.label}
								to={link.to}
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								{t(link.label)}
							</Link>
						))}
					</nav>
					<div className="hidden md:flex gap-4 items-center">
						<Link
							to={normalizeLink("/auth/signin")}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{t("nav_login")}
						</Link>
						<Button
							className="rounded-full"
							asChild
						>
							<Link to={normalizeLink("/auth/signup")}>
								{t("nav_get_started")}
								<ChevronRight className="ml-1 size-4" />
							</Link>
						</Button>
					</div>
					<div className="flex items-center gap-4 md:hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="size-5" />
							) : (
								<Menu className="size-5" />
							)}
							<span className="sr-only">Toggle menu</span>
						</Button>
					</div>
				</div>
				{/* Mobile menu */}
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
					>
						<div className="container py-4 flex flex-col gap-4">
							{NAV_LINKS.map((link) => (
								<Link
									key={link.label}
									to={link.to}
									className="py-2 text-sm font-medium"
									onClick={() => setMobileMenuOpen(false)}
								>
									{t(link.label)}
								</Link>
							))}
							<div className="flex flex-col gap-2 pt-2 border-t">
								<Link
									to={normalizeLink("/auth/signin")}
									className="py-2 text-sm font-medium"
									onClick={() => setMobileMenuOpen(false)}
								>
									{t("nav_login")}
								</Link>
								<Button className="rounded-full" asChild>
									<Link
										to={normalizeLink("/auth/signup")}
										onClick={() => setMobileMenuOpen(false)}
									>
										{t("nav_get_started")}
										<ChevronRight className="ml-1 size-4" />
									</Link>
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</header>
			<main className="flex-1">
				<Outlet />
			</main>
			<footer className="w-full border-t bg-background/95 backdrop-blur-sm">
				<div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
					<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
						<div className="space-y-4">
							<div className="flex items-center gap-2 font-bold">
								<img
									src={logo_path}
									alt={`${brandName} logo`}
									className="h-8 object-contain "
								/>
							</div>
							<p className="text-sm text-muted-foreground">
								{t("footer_description")}
							</p>
							<div className="flex gap-4">
								{SOCIALS.map((social) => {
									const Icon = social.icon
									return (
										<Link
											to="#"
											key={social.name}
											className="text-muted-foreground hover:text-foreground transition-colors"
										>
											<Icon className="size-5" />
											<span className="sr-only">{social.name}</span>
										</Link>
									)
								})}
							</div>
						</div>
						{FOOTER_SECTIONS.map((section) => (
							<div className="space-y-4" key={section.title}>
								<h4 className="text-sm font-bold">{t(section.title)}</h4>
								<ul className="space-y-2 text-sm">
									{section.links.map((link) => (
										<li key={link.label}>
											<Link
												to={link.to}
												className="text-muted-foreground hover:text-foreground transition-colors"
											>
												{t(link.label)}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8">
						<p className="text-xs text-muted-foreground">
							&copy; {new Date().getFullYear()} {brandName}. {t("footer_rights")}
						</p>
						<div className="flex gap-4">
							{FOOTER_BOTTOM_LINKS.map((link) => (
								<Link
									key={link.label}
									to={link.to}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									{t(link.label)}
								</Link>
							))}
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
