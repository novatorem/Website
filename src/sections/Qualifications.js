import { graphql, useStaticQuery } from "gatsby";
import React from "react";
import Heading from "../components/Heading";
import { AiFillSafetyCertificate, FaAngleRight } from "../components/Icons";
import styles from "./Meta.module.css";

const Qualifications = () => {
  const data = useStaticQuery(graphql`
    {
      allQualificationsJson {
        edges {
          node {
            id
            title
            subtitle
          }
        }
      }
    }
  `);

  return (
    <section id="qualifications">
      <Heading icon={AiFillSafetyCertificate} title="Qualifications" />

      {data.allQualificationsJson.edges.map(({ node }, index) => (
        <div
          key={node.id}
          className={`${styles.container} wow fadeInDown`}
          style={{
            animationDuration: `${index * 200 + 500}ms`,
          }}
        >
          <div className="mt-1 pr-6">
            <FaAngleRight />
          </div>
          <div>
            <h6 className="font-semibold">{node.title}</h6>
            <p className="text-sm">{node.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Qualifications;
