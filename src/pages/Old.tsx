import { Tabs } from "@mantine/core";

export default function Old() {
  return (
    <div>
      <h2>Collaboration</h2>

      <Tabs defaultValue="gallery">
        <Tabs.List>
          <Tabs.Tab value="gallery">Meetings</Tabs.Tab>
          <Tabs.Tab value="messages">Tasks</Tabs.Tab>
          <Tabs.Tab value="messages">Social</Tabs.Tab>
          <Tabs.Tab value="messages">Labour</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="gallery">
          <h3>Current living situation:</h3>
          <ul>
            <li>Dependents</li>
            <li>Pets</li>
            <li>Current housing</li>
          </ul>
        </Tabs.Panel>

        <Tabs.Panel value="messages">
          <h3>Future living vision</h3>
          <ul>
            <li>Ideal locations</li>
            <li>Describe your ideal living arrangement</li>
            <li></li>
          </ul>
        </Tabs.Panel>
      </Tabs>

      <ul>
        <li>Values in the context of this project</li>
        <li>Dietaries</li>
        <li>Accessibility needs</li>
        <li>Accomodation requests</li>
      </ul>

      <h2>Living Together</h2>

      <Tabs defaultValue="gallery">
        <Tabs.List>
          <Tabs.Tab value="gallery">Current</Tabs.Tab>
          <Tabs.Tab value="messages">Future</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="gallery">
          <h3>Current living situation:</h3>
          <ul>
            <li>Dependents</li>
            <li>Pets</li>
            <li>Current housing</li>
          </ul>
        </Tabs.Panel>

        <Tabs.Panel value="messages">
          <h3>Future living vision</h3>
          <ul>
            <li>Ideal locations</li>
            <li>Describe your ideal living arrangement</li>
            <li></li>
          </ul>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
