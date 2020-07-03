import React from "react";
import Heading from "../components/Heading";
import { FaInfoCircle, FaStar } from "../components/Icons";
import { useStaticQuery, graphql } from "gatsby";
import Button from "../components/Button";
import Social from "../components/Social";

const Footer = () => {
  const data = useStaticQuery(graphql`
    {
      markdownRemark(frontmatter: { id: { eq: "about-novac" } }) {
        html
      }
    }
  `);

  return (
    <section id="footer">
      <Heading icon={FaInfoCircle} title="About novac.dev" />

      <div
        className="text-justify w-full md:w-4/5 lg:w-3/4 wow fadeIn"
        dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }}
      />
      
      <div className="w-full md:w-auto h-6 my-6">
        {<Social />}
      </div>

      {/* <Button
        className="mt-6"
        icon={FaStar}
        title="Check it out on Github!"
        onClick={() =>
          window.open(
            "https://github.com/Novatorem/Website",
            "_blank",
          )
        }
      /> */}

      <div className="pt-8 pb-8 text-xs leading-relaxed opacity-25">
        <div>Licensed under MIT.</div>
        <div>Copyright {new Date().getFullYear()} Novatorem</div>
      </div>
    </section>
  );
};

export default Footer;
