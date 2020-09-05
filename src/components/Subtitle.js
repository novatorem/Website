import React from "react";
import PropTypes from "prop-types";
import Typist from "react-typist";

const Subtitle = ({ onDone }) => (
  <Typist
    startDelay={500}
    avgTypingDelay={30}
    cursor={{ show: false }}
    className="my-2 flex lg:h-32"
    onTypingDone={onDone}
  >
    <code className="w-full text-sm leading-loose">
      <div>
        <span className="text-blue-600">traits</span>
        []{" "}
        <span className="text-orange-400">novatorem</span>{" "}
        <span className="text-blue-600">=</span> {"{"}
      </div>
      <div className="lg:pl-8">
        <span className="text-red-500">Developer</span>,{" "}
        <span className="text-red-500">Reader</span>,{" "}
        <span className="text-red-500">Curator</span>,{" "}
        <span className="text-red-500">Techie</span>,{" "}
      </div>
      <div className="lg:pl-8">
        <span className="text-red-500">...</span>{" "}
      </div>
      <div>{"}"};</div>
    </code>
  </Typist>
);

Subtitle.propTypes = {
  onDone: PropTypes.func.isRequired,
};

export default Subtitle;
