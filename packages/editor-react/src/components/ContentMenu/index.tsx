import { MenuButton, MenuComponent } from "@editor/type";
import { useState } from "react";

const ContentMenu: React.FC<{
  menuData?: (MenuButton | MenuComponent)[];
  isSubMenu?: boolean;
  active?: string | number;
  autoHide?: boolean;
}> = ({ menuData = [], autoHide = true, isSubMenu = false, active }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="magic-editor-content-menu"
      style={{ display: visible ? "block" : "none" }}
    ></div>
  );
};

export default ContentMenu;
