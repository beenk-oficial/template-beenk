import { NavLink, useParams } from "react-router";
import { normalizeLink } from "@/utils";

interface CustomLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  className,
  children,
}) => {
  const params = useParams();
  
  return (
    <NavLink to={normalizeLink(href, params)} className={className}>
      {children}
    </NavLink>
  );
};

export default CustomLink;
