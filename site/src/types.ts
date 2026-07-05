export type Category = { id: string; label: string; color: string };

export type GNode = {
  id: string;
  label: string;
  category: string;
  url: string;
  desc: string;
  descEn?: string | null;
  stars: number;
  isHub?: boolean;
  // assigned by the force engine at runtime
  x?: number;
  y?: number;
};

export type GLink = {
  source: string | GNode;
  target: string | GNode;
  type: "cluster" | "hub" | "cross";
};

export type GraphData = {
  generated?: string;
  categories: Category[];
  nodes: GNode[];
  links: GLink[];
};
