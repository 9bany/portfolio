// Skills Icons
import htmlIcon from "./images/html.svg"
import cssIcon from "./images/css.svg"
import reactIcon from "./images/react.svg"
import jsIcon from "./images/javascript.svg"
import designIcon from "./images/design.svg"
import codeIcon from "./images/code.svg"

// Social Icon
import githubIcon from "./images/github.svg"
import codepenIcon from "./images/codepen.svg"
import dribbbleIcon from "./images/dribbble.svg"
import instagramIcon from "./images/instagram.svg"
import project_umbala from "./images/project_umbala.png";
import project_kanoo from "./images/project_kanoo.png";
import project_joyid from "./images/project_joyid.png";
import project_mylahomestay from "./images/project_mylahomestay.png";
import project_olli from "./images/project_olli.png";
import tour_player_demo from "./images/tour-player-demo.png";
import me from "./images/me.png";

export default {
  //(Please Do Not Remove The comma(,) after every variable)
  //Change The Website Template

  //   Header Details ---------------------
  name: "bany",

  headerTagline: [
    //Line 1 For Header
    "Building software,",
    //Line 2 For Header
    "design system",
  ],
  //   Header Paragraph
  headerParagraph:
    "A student, i'm always a junior developer",

  //Contact Email
  contactEmail: "bany.y0599@gamil.com",

  // End Header Details -----------------------

  // Work Section ------------------------
  projects: [
    {
      title: "UmbalaTv App", //Project Title - Add Your Project Title Here
      para:
        "Life style + social  + ecommerce for gen Z.", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc: project_umbala,
      //Project URL - Add Your Project Url Here
      url: "https://umbala.io/",
    },
    {
      title: "Kanoo App", //Project Title - Add Your Project Title Here
      para:
        "Send & Receive Money Instantly.", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc: project_kanoo,
      //Project URL - Add Your Project Url Here
      url: "https://apps.apple.com/us/app/kanoo/id1489706474",
    },
    {
      title: "JoyID", //Project Title - Add Your Project Title Here
      para:
        "Face ID for payment", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc: project_joyid,
      //Project URL - Add Your Project Url Here
      url: "https://joy-id.com/",
    },
    {
      title: "MYLA HOMESTAY", //Project Title - Add Your Project Title Here
      para:
        "Where friends become a family and a place become a second home", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc: project_mylahomestay,
      //Project URL - Add Your Project Url Here
      url: "https://www.mylahomestay.com/",
    },
    {
      title: "360 Tour", //Project Title - Add Your Project Title Here
      para:
        "VR Tour.",
      //Project Image - Add Your Project Image Here
      imageSrc: tour_player_demo,
      //Project URL - Add Your Project Url Here
      url: "http://tour-player.herokuapp.com/?fov=90&lat=-1.63&lon=-30.91&id=1",
    },
    {
      title: "Maika", //Project Title - Add Your Project Title Here
      para:"Virtual assistant for Vietnamese people",
      //Project Image - Add Your Project Image Here
      imageSrc: project_olli,
      //Project URL - Add Your Project Url Here
      url: "https://olli.vn/products/loa-thong-minh-maika",
    },
  ],

  // End Work Section -----------------------

  // About Secton --------------
  aboutParaOne:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
  aboutParaTwo:
    "",
  aboutParaThree:
    "",
  aboutImage:me,

  //   End About Section ---------------------

  // Skills Section ---------------

  //   Import Icons from the top and link it here

  skills: [
    {
      img: htmlIcon,
      para:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      img: cssIcon,
      para:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      img: jsIcon,
      para:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      img: reactIcon,
      para:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      img: designIcon,
      para:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      img: codeIcon,
      para:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
  ],

  // End Skills Section --------------------------

  //   Promotion Section --------------------------

  promotionHeading: "Heading",
  promotionPara:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  // End Promotion Section -----------------

  //   Contact Section --------------

  contactSubHeading: "Let's create your next experience together",
  social: [
    // Add Or Remove The Link Accordingly
    { img: githubIcon, url: "https://github.com/chetanverma16" },
    {
      img: codepenIcon,
      url: "https://www.codepen.com/",
    },
    {
      img: dribbbleIcon,
      url: "https://dribbble.com/chetanverma",
    },
    {
      img: instagramIcon,
      url: "https://www.instagram.com/",
    },
  ],

  // End Contact Section ---------------
}

// Thanks for using this template, I would love to hear from you contact me at hello@chetanverma.com
