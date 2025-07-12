import { Avatar as MantineAvatar } from "@mantine/core";

export const minAvatarId = 1;
export const maxAvatarId = 10;

export const avatarUrl = (id: number) => {
  let number = (id % 10) + 1;
  if (number === 5) number = 2;
  return `https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-${number}.png`;
};

interface AvatarProps {
  avatarId: number;
}

export default function Avatar({ avatarId }: AvatarProps) {
  return <MantineAvatar size={30} src={avatarUrl(avatarId)} radius={30} />;
}
