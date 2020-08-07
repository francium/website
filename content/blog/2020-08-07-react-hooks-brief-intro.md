---
title: "React Hooks: A very brief intro"
date: 2020-08-07T12:00:00-04:00
---


React Hooks API appears to be a immediate-mode layer on top of the traditional
retained-mode style React system.

Internally, the library knows which component is currently being rendered and
since a hook can only be called from a React component function or another hook,
React is able to keep track of function calls to the hook APIs to 'magically'
manage state without being explicit about function calls across multiple render
cycles.

To ensure this all works, React requires, you to follow two rules,
1. Only Call Hooks at the Top Level
    - To ensure consistent call order each render so React can keep track of
    things
2. Only Call Hooks from React Functions (from a React component function or
   another hook)
    - So React knows which component is being rendered

```jsx
function SomeComponent {
  // Internally, React keeps track of which `useState/useEffect/etc.` API call
  // is being made using by knowing what component is being rendered and in what
  // order hook API calls are made (possible only because of the two rules you
  // are required to follow when using hook API
  const [count, setCount] = useState(0);

  // - if array specified (second arg), then React avoids re-running if value
  // hasn't changed since last render cycle
  // - if empty array, only run on component creation and destroy
  useEffect(() => {
    // some effect
  }, [someValue]);

  return (
    // ...some jsx
  )
}
```

When using the `useEffect` API, you can also return a function to perform clean
up. This clean up function is called when the effect is re-run or component is
destroyed - automatically, no need to do anything manually (might be
over-simplifying, need to verify).


## Purpose of React Hooks
To allow separation of concerns (business logic, functionality) within a
component.

Consider the example from React Hooks docs,
```jsx
function useFriendStatus(friendId) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    handleStatusChange = status => setIsOnline(status.isOnline);

    ChatAPI.subscribeToFriendStatus(friendId, handleStatusChange);
    return () => ChatAPI.unsubscribeFromFriendStatus(friendId, handleStatusChange);
  });

  return isOnline;
}
```

And this state-based logic can be shared across components,
```jsx
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);
  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}

function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);
  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```


## Immediate Mode UI
React Hooks looks awfully lot like a immediate mode UI system built on-top of
whatever React is already doing internally.

An immediate mode UI is one which does not rely retaining state within the UI
code itself. Instead, a 'widget'/'component'/'whatever you want to call it', is
just a function call that is provided some arguments and the function produces
some piece of the UI without relying on anything except the function arguments.
The UI code is run within some loop, eg. a game loop, and each render cycle, the
same functions are called, perhaps with different arguments.

Immediate mode UIs are quite popular in game development, examples include
[nuklear](https://github.com/Immediate-Mode-UI/Nuklear) and
[Dear ImGUI](https://github.com/ocornut/imgui).

Immediate mode UIs are in contrast to retained mode UIs which relying on
maintaining state of the UI within the UI code itself. React classes, for
example, can be considered retained mode as they're using internal class state
to re-render.
