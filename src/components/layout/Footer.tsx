import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  Heart,
  ArrowUpRight,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'centered' | 'expanded' | 'minimal-modern';
  showSocial?: boolean;
  showContact?: boolean;
  showCopyright?: boolean;
  showLegal?: boolean;
  companyName?: string;
  logoSrc?: string;
}

export const Footer: React.FC<FooterProps> = ({
  className,
  variant = 'minimal-modern',
  showSocial = true,
  showContact = true,
  showCopyright = true,
  showLegal = true,
  companyName = 'BuildEase',
  logoSrc
}) => {
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const currentYear = new Date().getFullYear();
  
  // Define navigation links for the footer
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Testimonials', href: '#' },
        { label: 'FAQ', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contact', href: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Guides', href: '#' },
        { label: 'API', href: '#' },
        { label: 'Community', href: '#' }
      ]
    }
  ];
  
  // Social media links
  const socialLinks = [
    { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
    { icon: <Github className="w-4 h-4" />, href: '#', label: 'GitHub' },
    { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
    { icon: <Facebook className="w-4 h-4" />, href: '#', label: 'Facebook' }
  ];
  
  // Legal links
  const legalLinks = [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' }
  ];
  
  // Render different variants of the footer
  const renderFooterContent = () => {
    switch(variant) {
      case 'minimal-modern':
        return (
          <div className={cn(
            "border-t py-6 transition-all duration-300 backdrop-blur-sm",
            isDarkMode ? "border-slate-800/80 bg-slate-900/60" : "border-gray-100/80 bg-gray-50/60"
          )}>
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2 group">
                  {logoSrc && (
                    <img 
                      src="/buildease-logo-1.svg" 
                      alt={companyName} 
                      className="h-7 w-auto transition-transform duration-300 group-hover:scale-105" 
                    />
                  )}
                </div>
                
                {showLegal && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <Link to="/terms" className={cn(
                      "transition-all duration-200 hover:underline relative",
                      "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:transition-all",
                      isDarkMode 
                        ? "text-slate-400 hover:text-slate-300 after:bg-slate-300" 
                        : "text-gray-500 hover:text-gray-700 after:bg-gray-700"
                    )}>
                      Terms
                    </Link>
                    <Link to="/privacy" className={cn(
                      "transition-all duration-200 hover:underline relative",
                      "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:transition-all",
                      isDarkMode 
                        ? "text-slate-400 hover:text-slate-300 after:bg-slate-300" 
                        : "text-gray-500 hover:text-gray-700 after:bg-gray-700"
                    )}>
                      Privacy
                    </Link>
                    <Link to="/cookies" className={cn(
                      "transition-all duration-200 hover:underline relative",
                      "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:transition-all",
                      isDarkMode 
                        ? "text-slate-400 hover:text-slate-300 after:bg-slate-300" 
                        : "text-gray-500 hover:text-gray-700 after:bg-gray-700"
                    )}>
                      Cookies
                    </Link>
                  </div>
                )}
                
                {showSocial && (
                  <div className="flex items-center space-x-3">
                    {socialLinks.map((link, index) => (
                      <a 
                        key={index} 
                        href={link.href} 
                        className={cn(
                          "rounded-full p-1.5 transition-all duration-200",
                          "hover:scale-110 hover:shadow-sm",
                          isDarkMode 
                            ? "text-slate-400 hover:text-slate-50 hover:bg-slate-800/80" 
                            : "text-gray-400 hover:text-gray-900 hover:bg-gray-100/80"
                        )}
                        aria-label={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
                
                {showCopyright && (
                  <div className={cn(
                    "text-xs opacity-75 transition-opacity duration-300 hover:opacity-100",
                    isDarkMode ? "text-slate-500" : "text-gray-500"
                  )}>
                    © {currentYear} {companyName}. All rights reserved.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'minimal':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                {logoSrc && (
                  <img 
                    src="/buildease-logo-1.svg" 
                    alt={companyName} 
                    className="h-8 w-auto mr-3" 
                  />
                )}
                <span className={cn(
                  "text-sm",
                  isDarkMode ? "text-slate-300" : "text-gray-600"
                )}>
                  © {currentYear} {companyName}. All rights reserved.
                </span>
              </div>
              
              {showSocial && (
                <div className="flex items-center space-x-3">
                  {socialLinks.map((link, index) => (
                    <a 
                      key={index} 
                      href={link.href} 
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isDarkMode 
                          ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'centered':
        return (
          <div className="container mx-auto px-4 py-10 text-center">
            <div className="mb-6">
              {logoSrc && (
                <img 
                  src="/buildease-logo-1.svg" 
                  alt={companyName} 
                  className="h-12 w-auto mx-auto mb-4" 
                />
              )}
              
              <p className={cn(
                "max-w-md mx-auto mb-6",
                isDarkMode ? "text-slate-300" : "text-gray-600"
              )}>
                Simplifying construction project management for teams of all sizes.
              </p>
              
              {showSocial && (
                <div className="flex justify-center space-x-4 mb-6">
                  {socialLinks.map((link, index) => (
                    <a 
                      key={index} 
                      href={link.href} 
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isDarkMode 
                          ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {showLegal && (
              <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
                {legalLinks.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.href} 
                    className={cn(
                      "transition-colors",
                      isDarkMode 
                        ? "text-slate-400 hover:text-white" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            
            {showCopyright && (
              <div className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-gray-500"
              )}>
                © {currentYear} {companyName}. All rights reserved.
              </div>
            )}
          </div>
        );
        
      case 'expanded':
        return (
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="mb-4">
                  {logoSrc && (
                    <img 
                      src="/buildease-logo-1.svg" 
                      alt={companyName} 
                      className="h-10 w-auto mb-4" 
                    />
                  )}
                  <p className={cn(
                    "text-sm mb-4",
                    isDarkMode ? "text-slate-300" : "text-gray-600"
                  )}>
                    Streamlining construction management with smart tools that grow with your business.
                  </p>
                </div>
                
                {showContact && (
                  <div className="space-y-3">
                    <h3 className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      Contact Us
                    </h3>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      <a 
                        href="mailto:hello@buildease.com" 
                        className={cn(
                          "transition-colors",
                          isDarkMode ? "text-slate-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        hello@buildease.com
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <a 
                        href="#" 
                        className={cn(
                          "transition-colors",
                          isDarkMode ? "text-slate-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        Live Chat Support
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {footerLinks.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className={cn(
                    "text-sm font-semibold mb-4",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a 
                          href={link.href} 
                          className={cn(
                            "text-sm transition-colors flex items-center",
                            isDarkMode 
                              ? "text-slate-300 hover:text-white" 
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className={cn(
              "pt-6 border-t flex flex-col md:flex-row justify-between items-center",
              isDarkMode ? "border-slate-800" : "border-gray-200"
            )}>
              {showCopyright && (
                <div className={cn(
                  "text-sm mb-4 md:mb-0",
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                )}>
                  © {currentYear} {companyName}. All rights reserved.
                </div>
              )}
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                {showLegal && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    {legalLinks.map((link, index) => (
                      <a 
                        key={index} 
                        href={link.href} 
                        className={cn(
                          "transition-colors",
                          isDarkMode 
                            ? "text-slate-400 hover:text-white" 
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
                
                {showSocial && (
                  <div className="flex items-center space-x-3 mt-4 md:mt-0 md:ml-6">
                    {socialLinks.slice(0, 3).map((link, index) => (
                      <a 
                        key={index} 
                        href={link.href} 
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isDarkMode 
                            ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        )}
                        aria-label={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs flex items-center justify-center">
                Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> 
                <span>in Accra, Ghana</span>
              </p>
            </div>
          </div>
        );
        
      case 'default':
      default:
        return (
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="mb-4">
                  {logoSrc && (
                    <img 
                      src="/buildease-logo-1.svg" 
                      alt={companyName} 
                      className="h-8 w-auto mb-4" 
                    />
                  )}
                  <p className={cn(
                    "text-sm mb-4 max-w-md",
                    isDarkMode ? "text-slate-300" : "text-gray-600"
                  )}>
                    BuildEase helps construction teams streamline project management, collaborate effectively, and deliver projects on time and on budget.
                  </p>
                </div>
                
                {showContact && (
                  <div className="flex items-center mb-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "mr-3",
                        isDarkMode && "border-slate-700 text-white hover:bg-slate-800"
                      )}
                    >
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Contact Us
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        isDarkMode && "border-slate-700 text-white hover:bg-slate-800"
                      )}
                    >
                      Request Demo <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                
                {showSocial && (
                  <div className="flex items-center space-x-3">
                    {socialLinks.map((link, index) => (
                      <a 
                        key={index} 
                        href={link.href} 
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isDarkMode 
                            ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        )}
                        aria-label={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {footerLinks.map((section, sectionIndex) => (
                <div key={sectionIndex} className="md:col-span-1">
                  <h3 className={cn(
                    "text-sm font-semibold mb-4",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a 
                          href={link.href} 
                          className={cn(
                            "text-sm transition-colors",
                            isDarkMode 
                              ? "text-slate-300 hover:text-white" 
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className={cn(
              "pt-6 border-t flex flex-col md:flex-row justify-between items-center", 
              isDarkMode ? "border-slate-800" : "border-gray-200"
            )}>
              {showCopyright && (
                <div className={cn(
                  "text-sm mb-4 md:mb-0",
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                )}>
                  © {currentYear} {companyName}. All rights reserved.
                </div>
              )}
              
              {showLegal && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {legalLinks.map((link, index) => (
                    <a 
                      key={index} 
                      href={link.href} 
                      className={cn(
                        "transition-colors",
                        isDarkMode 
                          ? "text-slate-400 hover:text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };
  
  return (
    <footer 
      className={cn(
        "mt-auto border-t",
        isDarkMode 
          ? "bg-slate-900 border-slate-800 text-white" 
          : "bg-white border-gray-200 text-gray-900",
        className
      )}
    >
      {renderFooterContent()}
    </footer>
  );
}; 