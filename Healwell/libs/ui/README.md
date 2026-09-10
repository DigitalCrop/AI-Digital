# @healthcare/ui

Small shared UI library for Healwell MFEs. Includes basic components and Storybook stories.

Run Storybook:

```bash
cd libs/ui
npm install
npm run storybook
```

Build:

````bash
npm run build

Usage examples

```tsx
import React from 'react'
import { Button, Input, Icon, Form } from '@healthcare/ui'

export default function Example(){
	return (
		<Form onSubmit={()=>{}}>
			<Input label="Email" placeholder="you@example.com" />
			<Button variant="primary">Submit</Button>
			<Icon name="user" />
		</Form>
	)
}
````

Notes

- This is a minimal design-system starter. We'll add tokens, theming, and Storybook controls next.

```

```
