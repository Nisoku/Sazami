import { SazamiRow } from "./row";
import { SazamiColumn } from "./column";
import { SazamiGrid } from "./grid";
import { SazamiStack } from "./stack";
import { SazamiCard } from "./card";
import { SazamiText } from "./text";
import { SazamiHeading } from "./heading";
import { SazamiLabel } from "./label";
import { SazamiButton } from "./button";
import { SazamiIconButton } from "./icon-button";
import { SazamiInput } from "./input";
import { SazamiCheckbox } from "./checkbox";
import { SazamiToggle } from "./toggle";
import { SazamiImage } from "./image";
import { SazamiCoverart } from "./coverart";
import { SazamiIcon } from "./icon";
import { SazamiBadge } from "./badge";
import { SazamiTag } from "./tag";
import { SazamiDivider } from "./divider";
import { SazamiSpacer } from "./spacer";
import { SazamiSection } from "./section";
import { createGenericClass } from "./generic";
import { SazamiModal } from "./modal";
import { SazamiSelect } from "./select";
import { SazamiTabs } from "./tabs";
import { SazamiSlider } from "./slider";
import { SazamiRadio } from "./radio";
import { SazamiSwitch } from "./switch";
import { SazamiToast } from "./toast";
import { SazamiAvatar } from "./avatar";
import { SazamiChip } from "./chip";
import { SazamiSpinner, SazamiProgress } from "./spinner";
import { SazamiAccordion } from "./accordion";

export const COMPONENT_REGISTRY: Record<string, typeof HTMLElement> = {
  "saz-row": SazamiRow,
  "saz-column": SazamiColumn,
  "saz-grid": SazamiGrid,
  "saz-stack": SazamiStack,
  "saz-card": SazamiCard,
  "saz-text": SazamiText,
  "saz-heading": SazamiHeading,
  "saz-label": SazamiLabel,
  "saz-button": SazamiButton,
  "saz-icon-button": SazamiIconButton,
  "saz-input": SazamiInput,
  "saz-checkbox": SazamiCheckbox,
  "saz-toggle": SazamiToggle,
  "saz-image": SazamiImage,
  "saz-coverart": SazamiCoverart,
  "saz-icon": SazamiIcon,
  "saz-badge": SazamiBadge,
  "saz-tag": SazamiTag,
  "saz-divider": SazamiDivider,
  "saz-spacer": SazamiSpacer,
  "saz-section": SazamiSection,
  "saz-details": createGenericClass(),
  "saz-controls": createGenericClass(),
  "saz-modal": SazamiModal,
  "saz-select": SazamiSelect,
  "saz-tabs": SazamiTabs,
  "saz-slider": SazamiSlider,
  "saz-radio": SazamiRadio,
  "saz-switch": SazamiSwitch,
  "saz-toast": SazamiToast,
  "saz-avatar": SazamiAvatar,
  "saz-chip": SazamiChip,
  "saz-spinner": SazamiSpinner,
  "saz-progress": SazamiProgress,
  "saz-accordion": SazamiAccordion,
};

export function registerComponents(): void {
  if (typeof customElements === "undefined") return;
  Object.entries(COMPONENT_REGISTRY).forEach(([tag, cls]) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, cls);
    }
  });
}
