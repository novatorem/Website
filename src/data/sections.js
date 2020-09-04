import {
  AiFillSafetyCertificate,
  FaAward,
  FaDev,
  FaInfoCircle,
  GoTools,
  IoIosDocument,
  MdPerson,
  MdSchool,
  MdWork,
  MdMusicNote,
} from "../components/Icons";

const sections = [
  { id: "about-me", title: "About Me", icon: MdPerson },
  { id: "work", title: "Work", icon: MdWork },
  { id: "education", title: "Education", icon: MdSchool },
  { id: "skills", title: "Skills", icon: GoTools },
  { id: "projects", title: "Projects", icon: FaDev },
  { id: "achievements", title: "Achievements", icon: FaAward },
  { id: "music", title: "Music", icon: MdMusicNote },
  {
    id: "qualifications",
    title: "Qualifications",
    icon: AiFillSafetyCertificate,
  },
  { id: "resume", title: "Resume", icon: IoIosDocument },
  { id: "footer", title: "About", icon: FaInfoCircle },
];

export default sections;
