## Install lerna

```
yarn global add lerna
```

## Install all

```
lerna bootstrap
```

## Run all

```
lerna run --parallel dev
```

## Run scope
```
lerna run --scope `lib-name` dev
```

## Build all

```
lerna run --parallel build:lib
```