type Props<Tag extends keyof HTMLElementTagNameMap> = Partial<HTMLElementTagNameMap[Tag]>;

export const el = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  props: Props<Tag> = {},
  children: readonly (Node | string)[] = [],
): HTMLElementTagNameMap[Tag] => {
  const node = document.createElement(tag);

  Object.assign(node, props);
  node.append(...children);

  return node;
};
