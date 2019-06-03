---
title: "An Implementation of Parallel Shearshort in C using PThreads"
date: 2019-02-22
---

This will be a look at a parallel implementation of Shearsort using POSIX Threads
(PThreads) in the C programming language.

*This is not meant to be an efficient or optimal implementation, nor should it be
considered production ready code. This is purely an educational exercise. I'm also not a
seasoned C/C++ developer, so expect some errors or downright stupidity here and there. If
you have any suggestions for improvements feel free to [create an issue on
GitHub](https://github.com/francium/website/issues).*

---

A high level description of shearshort is as follows,

> Given a `n`x`n` matrix of values of a total of `N` values, sort the values such that
> each odd row is sorted in increasing order and each even row is sorted in decreasing
> order with each row below having only values greater or equal to the previous row.

Visually it would mean a given matrix of 9 values would be sorted as such,

Input:
```
4 3 1
9 8 7
5 6 0
```

Output:
```
0 1 2
5 4 3
6 7 8
```

The basic principle behind the implementation is to carry out `ceil(log(N) + 1)`
iterations (phases) starting at 1, where `N` is the number of elements in the matrix, with
the matrix being sorted after the last phase. The operations performed in each based
depends on whether the phase is even or odd.

On an odd phase, sort the even rows in increasing order and odd rows in decreasing order.
On an even phase, sort all columns in increasing order.

Visually it would look like this (here the arrows indicate direction of increasing
values after the completion of a phase),

Phases 1, 3, 5...
```
-> -> ->
<- <- <-
-> -> ->
```

Phases 2, 4, 6...
```
| | |
| | |
v v v
```

Let's look at an example of a matrix undergoing Shearsort to get a full picture.

Given `N = 9`, `ceil(log(9) + 1) = 5`, we will run for 5 phases.

Initially
```
4 3 1
9 8 7
5 6 0
```

After Phase 1 (row sort)
```
1 3 4  ->
9 8 7  <-
0 5 6  ->
```

After Phase 2 (column sort)
```
0 3 4  |
1 5 6  |
9 8 7  v
```

After Phase 3 (row sort)
```
0 3 4  ->
6 5 1  <-
7 8 9  ->
```

After Phase 4 (column sort)
```
0 3 1  |
6 5 4  |
7 8 9  v
```

After Phase 5 (row sort)
```
0 1 3  ->
6 5 4  <-
7 8 9  ->
```

## Implementation

### Sorting an array

First thing that's needed is an array sorting function. We will do a simple bubble sort,
but any other array sorting algorithm will suffice.

We'll define a header and source file for the bubble sort,

**bubble.h**
```
#include <stddef.h>

#ifndef BUBBLE_H
#define BUBBLE_H

void sort(int arr[], size_t size);

#endif
```

**bubble.c**
```
#include "bubble.h"

void sort(int arr[], size_t size) {
    for (int i = size - 1; i > 0; i--) {
        int max_i = 0;
        for (int j = 0; j <= i; j++) {
            if (arr[j] > arr[max_i]) max_i = j;
        }
        int t = arr[i];
        arr[i] = arr[max_i];
        arr[max_i] = t;
    }
}
```

In the header we've used the `#ifndef` include guard ([see this explaination for more
information about why it might be a good idea to use it][1]).

### Improving bubble sort

One limiation we see in our bubble sort implementation is the inability to specify whether
it should sort in increasing or decreasing order. In order to remindy this, we need to
parameterize the sort function so we can provide it with a comparision function. This will
be enough to give us the ability to specify an increasing or decreasing sort. An other
alternative is to pass in some other scalar value such an an enum or `DEC` or `INC`, but
we'll use functions so we can explore function pointers a bit.

We will first defined two additional [inline][1] functions in the header and source files.
And we'll also modify the `sort` function enable paramertization.

**bubble.h**
```
...

int cmp_min(int, int);
int cmp_max(int, int);
...
```

**bubble.c**
```
...

int cmp_min(int a, int b) {
  return a < b ? 1 : 0;
}

int cmp_max(int, int) {
  return a > b ? 1 : 0;
}

// Bubble sort function with just the new changed highlighted
void sort(int arr[], size_t size, int (*cmp)(int, int)) {
    for (...) {
        ...
        for (...) {
            if (cmp(arr[j], arr[k])) k = j;
        }
        ...
    }
}
```

### Implementing a squential shearsort

With array sorting out of the way, we can focus on the shearsort implementation. Basic
algorithm would be (pseudocode),
```
P = ceil(log2(n) + 1)
for phase = 1..(P-1)
    if phase even
        for col = 0..(n-1)
            sort column 'col' in increasing order
    if phase odd
        for row = 0..(n-1)
            if row even
                sort row 'row' in increasing order
            else
                sort row 'row' in decreasing order
```

This algorithm is great, but it would be a real pain trying to adjust our sorting
algorithm and implementation to row columns. And C wouldn't provide any help.

A much better solution is to just transpose the matrix after each phase. This may seem
like an expensive thing to do, but there are some important advantages,

- Cleaner code: A column become a row after a transpose. All out existing code works
  without any changes. Although the computer doesn't care how the code looks, or even if
  it's efficient, other people will need to look at it. It's a good idea to write code
  that is readable and performant. Sometimes there is a tradoff, but here we don't have to
  any sacrifices with reability.
- [Cache locaility][3]: Since we will be storing out matrix as a single array of length `N`, we
  will need to keep in mind that sequential elements of the array will be stored in memory
  and more importantly in the cache next to each other. If we started accessing things
  vertically (i.e. iterating per column instead of per row, we would be trying to access
  data that is not stored sequentially). This would inevitablly lead to poor performance
  due to the inevetiable cache missed we'll suffer from as `N` increases in size.

So that means we should define a transpose function now,

**main.c**
```
#include <stddef.h>

void transpose(int arr[], size_t size) {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            // Only process lower half of matrix
            if (j < i) continue;
            int t = arr[i * size + j];
            arr[i * size + j] = arr[j * size + i];
            arr[j * size + i] = t;
        }
    }
}
```

There's not much going on here, but keep in mind we'll just process the lower half of the
matrix to avoid undoing our changes by processing the other half as well. One thing to
note is that since we're using a 1D array to hold our matrix, we need to do some math in
order to make sure we're accessing the correct part of the array so it corresponds to the
right row and column. The translation is `matrix[row][col) --> array[row * size + col]`.
Take a moment to prove to yourself this will do that right thing.

One more thing we'll quickly do is create a function to print out the matrix so we have an
idea of what's going on at each phase,

**main.c**
```
#include <stdio.h>
...

void print_matrix(int arr[], size_t size) {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            printf("%-5d ", arr[i * size + j]);
        }
        printf("\n");
    }
}

...
```

Now we'll finish implemnting shearsort using this transpose function.

**main.c**
```
...
#include <math.h>
#include "bubble.h"

...

int main() {
    int N = 9;
    int n = 3;
    int arr[N] = {4, 3, 1, 9, 8, 7, 5, 6, 0};

    // shearsort
    const int P = log2(n) + 1;
    for (int phase = 1; phase < P; phase++) {
        if (phase % 2 == 0) {
            for (int col = 0; col < n; col++)
                sort(arr[col], n, cmp_max);
        } else {
            for (int row = 0; row < n; row++)
                // Sort in increasing or decreasing order depending on row
                sort(arr[row],
                     n,
                     row % 2 == 0 ? cmp_max : cmp_min);
        }

        printf("\n");
        print_matrix(arr, s);
        printf("After phase %d (%s)\n",
               phase,
               phase % 2 == 0 ? "col sort" : "row sort");
    }

    return 0;
}
```

## Parallel

Now that we've got a working shearsort using a single thread (the main thread), we need to
tihnk about how we can split the work up across multiple threads. Since we're using C, we
won't have many fancy tools to help us out. The one thing we do have are PThreads. I guess
we also have the option to fork our process and create a bunch of child processes, but
that's probably not a good idea due to the immense overhead of creating the processes and
mangaing IPC among them.

When we split out work among multiple threads, we can choose to create duplicate copies of
the matrix, but that's a lot of memory usage without much benefit since we'll have to
merge the copies into a single copy after each phase. The only option we have then is to
hand out rows of the matrix on a per-thread basis -- assuming we're going to create `n`
threads to handle each row of the matrix.

The issue is now how do we synchrnoize the work being done among the `n` threads? The
simplest approach would appear to be,
```
global N
global n
global arr

global phase
global start
global stillWorking

function worker(k)
    block until start
    if phase even
        sort 'k'th row of arr in increasing order
    if phase odd
        if k even
            sort k'th row of arr in increasing order
        else
            sort k'th row of arr in decreasing order

function main
    start = false
    for i = 0..(n-1)
        create thread and assign it to run 'worker' function with arguments (i)

    P = ceil(log2(n) + 1)
    for phase = 1..(P-1)
        stillWorking = n
        start = true
        block until stillWorking > 0
        stillWorking = false
        tranpose arr
```

I tried this approach and it got really ugly really fast. The synchronization primitives
available when you try this approach are PThread's [mutexes][4] and [condition
variables][5]. Both of which are fine and all, but make it hard to get mutual exclusion
right especially when you're trying to synchronize thing that are co-dependent on each
other to start and stop working.

Maybe you'll have better luck and can come up with a nice solution
using just mutexes and condition variable and or sempahores. I decided to move up a level
and build a new concurrency primitive on top of the mutexes and condition variables. I
shall call it... a queue. Okay, a queue already exists, it's not a new primitive, but it
is a very powerful primtiive that is used often when dealing concurrency. The only thing
is, a regular old queue is not actuall thread safe. In order to make a thread safe queue,
we will need to make sure we implement mutual exclusion in the critical sections.

But first, we'll just write a regular queue to get the ball rolling.

### A Queue

#### But why?
Actually, before we start writing code, let's talk about why a queue works for us in this
context. First, let's look at what we're trying to do. We have a single master and a bunch
of workers, each of which does some work. Master needs to tell each worker what to work on
and then master waits for all of them to finish. By using a separate 'inbox' queue for
each worker, the master can easily tell each worker when to start work -- the work will
wait until something appears in its queue, do the work and repeat. Then we have the
problem of knowing when all the work is done and master can move on. This is solved by
using a single 'done' queue that all thread have access to. Each worker will enqueue
something (it doesn't matter what, we just care that something is there) into the queue
and the master will repeatedly (n times) dequeue from the queue (blocking until something
appears in the queue). Since each worker get a single thing to work on in our current
approach, it will enqueue a single thing to the 'done' queue. And since we have `n`
threads, master will know all are done after it reads `n` things from the 'done' queue.

#### Implementation

You can create a queue in many different ways, but I've chosen to use a [circular
buffer][6] with a couple of points to keep track of the head and tail of the queue. This
approach means you have a fixed capacity, but that's not an issue since we will only need
to stored a fixed amount of things when we use the queue. The implementation is also very
straight forward.

Our queue will not store actual numbers. It will store pointers to numbers. In fact, we
can use `void` pointers intead of `int` pointers to allow our queue to store any kind of
pointers and may this a generic queue that can be used anywhere!

The queue has a simple API, you initialize it, push pointers to things on it and take
oldest pushed pointer from it, as well as destroy it once you're done with it.

**queue.h**
```
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    void **buffer;
    int size;
    int capacity;
    int head;
    int tail;
} Queue;

void queue_init(Queue *queue, int capacity);
void queue_destroy(Queue *queue);
void* queue_dequeue(Queue *queue);
int queue_enqueue(Queue *queue, void *item);
```

**queue.c**
```
#include "queue.h"

void queue_init(Queue *queue, int capacity) {
    void *ptr = malloc((sizeof(int*)) * capacity);
    queue->buffer = (void **)ptr;
    queue->capacity = capacity;
    queue->size = 0;
    queue->head = 0;
    queue->tail = 0;
}

void queue_destroy(Queue *queue) {
  free(queue->buffer);
}

void* queue_dequeue(Queue *queue) {
    if (queue->size == 0) return NULL;

    void *item = queue->buffer[queue->head];
    queue->buffer[queue->head] = NULL;
    queue->head = (queue->head + 1) % queue->capacity;
    queue->size--;
    return item;
}

int queue_enqueue(Queue *queue, void *item) {
    if (queue->size == queue->capacity) return -1;

    queue->buffer[queue->tail] = item;
    queue->size++;
    queue->tail = (queue->tail + 1) % queue->capacity;
    return 0;
}
```

The queue itself is just a struct containing things we need to maintain it - a buffer that
contains the actual data in the queue (buffer), the current number of items in the queue
(size), the maximium number of items that can be stored in the queue (capacity), and two
pointer for the queue head and tail.

You will notice that the buffer is a pointer to a pointer. This is because the buffer
itself is an array (which is a pointer in the C world) and we want to store a pointer to
the array and not the array itself in the struct because the struct is of a fixed size at
compile time, but the array's size will depend on how large a queue the client using this
implemenation wants.

Taking a look at the implementation of the queue, we see we're using `malloc` to
dynamically create the buffer in the `queue_init` function, as well as doing other
initialization. Thus we also need to free that memory and we do so in the `queue_destory`
function using `free`.

The enqueue and dequeue functions are fairly straight forward. The only thing we need to
keep in mind is that since we're using the circular buffer approach we need to wrap the
head and tail pointers when we reach the end. We do this by doing some modulo arithmetic
in both functions.

```
queue->head = (queue->head + 1) % queue->capacity;
...
queue->tail = (queue->tail + 1) % queue->capacity;
```

We also had a bit of error handling in both functions to handle an empty queue.

### A Thread Safe Queue

This queue, in its current form, is not thread safe. It two thread try to enqueue an item
at the same time, something will happen, but probably not what you want. We need to make
sure only a single thread can read and write from a queue at a time. This is were the
mutexes and condition variables come in.

Since we already have a non-thread queue in place, all we need to do to make it thread
safe is add some mutual exclusion in the parts where two thread can read or write from the
same memory location.

The first thing we'll do is rename the existing enqueue and dequeue functions to
`_unsafe_queue_enqueue` and `_unsafe_queue_dequeue`. Unsafe meaning unsafe in a
multithreaded environment.

**queue.c**
```
...

static void* _unsafe_queue_dequeue(Queue *queue) {
    if (queue->size == 0) return NULL;

    void *item = queue->buffer[queue->head];
    queue->buffer[queue->head] = NULL;
    queue->head = (queue->head + 1) % queue->capacity;
    queue->size--;
    return item;
}

static int _unsafe_queue_enqueue(Queue *queue, void *item) {
    if (queue->size == queue->capacity) return -1;

    queue->buffer[queue->tail] = item;
    queue->size++;
    queue->tail = (queue->tail + 1) % queue->capacity;
    return 0;
}

...
```

Here we have also added [`static`][7] to make sure it can't be outside this file.

Next, let's look at how the mutex and condition variables work.

#### Mutex

A mutex is [lock][8] that can be acquired atomically. In the simplest terms it means only
one thread can hold it at a time. Using PThread's mutex requires declaraing a
variable of type `pthread_mutex_t`, initializing it, and using `pthread_mutex_lock` and
`pthread_mutex_unlock` to acquire and release it.

[For more information about PThread mutexes see this reference][4].

A simple example of a mutex,
```
pthread_mutex_t mtx;
pthread_mutex_init(&mtx, NULL);
pthread_mutex_lock(&mtx);
// do something unsafe in a multithreaded environment
pthread_mutex_unlock(&mtx);
pthread_mutex_destroy(&mtx);
```

#### Condition Variable

A [condition variable][9] lets us 'sleep' until someone wakes us up. But a condition
variable is associated with a lock so when we wake up, we acquire the lock too. So a
condition variable lets us elegantly block until we can proceed with our work. Using
PThread's condition variable require declaraing a variable of type `pthread_cond_t`,
initializing it using `pthread_cond_init`, and using `pthread_cond_wait` to wait until we
get a signal to wake up.

An important thing to keep in mind is that the `pthread_cond_wait` function must be called
while you have a lock on the mutex yourself. Calling wait will cause the mutex to be
released and reacquired with you wake up. Additionally, when you wake, you will have to
remember to unlock the mutex after you're done doing what you needed to do.

[For more information about PThread condition variables see this reference][5].

A simple example of a condition variable,
```
pthread_mutex_t mtx;
pthread_mutex_init(&mtx, NULL);
// ... some other thread locks mtx

pthread_cond_t cond;
pthread_cond_init(&cond);
// make sure you already have a lock on mtx youself when you call this
pthread_cond_wait(&cond, &mtx);
// do something
pthread_mutex_unlock(&mtx);
pthread_cond_destroy(&cond);
```

This is one big thing we have not mentioned yet. Who wakes us up when we run
`pthread_cond_wait`? The answer is someone has to call `pthread_cond_broadcast` or
`pthread_cond_singal`.

A broadcast will wake up all waiting threads and they will acquire the lock in some order.
A signal on the other hand will wake up a single waiting thread. If no thread are waiting,
nothing happens.

#### Making the queue thread safe

Now we can finally move onto discussing how to make the unsafe functions safe using a
mutex and condition variable.

First, we need to declare and initialize the mutex and condition variables.

**queue.h**
```
...

typedef struct {
    ...
    pthread_cond_t cond;
    pthread_mutex_t mutex;
} Queue;

...
```

**queue.c**
```
...

void queue_init(Queue *queue, int capacity) {
    ...
    pthread_cond_init(&queue->cond, NULL);
    pthread_mutex_init(&queue->mutex, NULL);
}

void queue_destroy(Queue *queue) {
    ...
    pthread_cond_destroy(&queue->cond);
    pthread_mutex_destroy(&queue->mutex);
}

...
```

Let's look at the enqueue first. You will note the function signature is the same as
before. Any existing user of this function will not be able to tell the difference, but
the functionality will now be thread safe.

**queue.c**
```
...

int queue_enqueue(Queue *queue, void *item) {
    pthread_mutex_lock(&queue->mutex);
    int rc = _unsafe_queue_enqueue(queue, item);
    pthread_mutex_unlock(&queue->mutex);
    pthread_cond_signal(&queue->cond);
    return rc;
}

...
```

Here we acquire the mutex, then run the unsafe enqueue operation, and then release the
lock. Finally, we issue a signal to wake up a single other blocked thread (we'll see why
someone who be blocked when we look at the dequeue). If we failed to issue this signal,
anyone who was blocked would remain blocked forever.

Turning our attention to dequeue we see that we don't need to make any changes to the
signture here either.

**queue.c**
```
...

void* queue_dequeue(Queue *queue) {
    pthread_mutex_lock(&queue->mutex);
    if (queue->size == 0) {
        pthread_cond_wait(&queue->cond, &queue->mutex);
    }
    void *item = _unsafe_queue_dequeue(queue);
    pthread_mutex_unlock(&queue->mutex);
    return item;
}

...
```

Here we acquire the mutex, check if the queue is empty, in which case we wait until
someone signals us to wake up (this occurs, as we saw, when someone else enqueues
something). In out case, we only want to wake up at most one blocked thread since we only
pushed a single item to the queue. If we instead woke up all threads that were blocked,
then we would have to check if the queue is no longer empty by the time a particular
thread acquire the lock after being woken up and potneitally start waiting again (remember
that a broadcast wakes up all those waiting and they will acquire the lock is some
indeterminte order). After we have been awakened, we do the unsafe dequeue operation and
release the mutex.

### Parallel shearsort

Finally, we can now refactor our shearsort to run across multiple threads without the
complexity of mutexes and condition variables thanks to our new thread safe queue
concurrecy primitive.

The new algorithm,
```
global N
global n
global arr

global taskQueues[n]
global doneQueue

function worker(k)
    _phase = dequeue from taskQueues[k]
    while _phase != 0
        if _phase even
            sort 'k'th row of arr in increasing order
        if _phase odd
            if k even
                sort k'th row of arr in increasing order
            else
                sort k'th row of arr in decreasing order
        enqueue NULL to doneQueue
        _phase = dequeue from taskQueues[k]


function main
    for i = 0..(n-1)
        create thread and assign it to run 'worker' function with arguments (i)

    P = ceil(log2(n) + 1)
    for phase = 1..(P-1)
        for i = 0..(n-1)
            enqueue phase to taskQueues[i]

        stillWorking = n
        while (stillWorking > 0)
            dequeue from doneQueue
            stillWorking--

        tranpose arr
```

In the actual implementation we will use a struct as an argument to the `worker` functions
so we don't have any global variables.

```
...

typedef struct {
    int id;
    int *arr;
    size_t size;
    Queue *inbox;
    Queue *outbox;
} WorkerArgs;

void* worker(void *args) {
    WorkerArgs *worker_args = (WorkerArgs*) args;
    int row = worker_args->id;
    int size = worker_args->size;
    int *arr = worker_args->arr;

    int *phase = queue_dequeue(worker_args->inbox);
    while (phase != NULL) {
        if (*phase % 2 == 0) {
            sort(&arr[row * size], size, cmp_max);
        } else {
            sort(&arr[row * size], size, row % 2 == 0 ? cmp_max : cmp_min);
        }

        queue_enqueue(worker_args->outbox, phase);
        phase = queue_dequeue(worker_args->inbox);
    }

    return 0;
}

int main(void) {
    int N = 9;
    int n = 3;
    int arr[N] = {4, 3, 1, 9, 8, 7, 5, 6, 0};

    Queue tq[N];
    Queue mq;
    queue_init(&mq, N);

    WorkerArgs args[N];
    pthread_t tids[N];

    for (int i = 0; i < n; i++) {
        queue_init(&tq[i], 1);
        args[i].id = i;
        args[i].arr = arr;
        args[i].size = n;
        args[i].inbox = &tq[i];
        args[i].outbox = &mq;
        pthread_create(&tids[i], NULL, worker, &args[i]);
    }

    int P = ceil(log2(N) + 1);
    for (int phase = 1; phase <= P; phase++) {
        for (int i = 0; i < n; i++)
            queue_enqueue(&tq[i], &phase);

        int remaining = n;
        while (remaining > 0) {
            queue_dequeue(&mq);
            remaining--;
        }

        printf("\n");
        print_matrix(arr, n);
        printf(
           "after Phase %d (%s)\n",
           phase,
           phase % 2 == 0 ? "col sort" : "row sort"
       );

        transpose(arr, n);
    }

    for (int i = 0; i < n; i++) queue_enqueue(&tq[i], NULL);
    for(int i = 0; i < n; i++) pthread_join(tids[i], NULL);

    queue_destroy(&mq);
    for (int i = 0; i < n; i++)
        queue_destroy(&tq[i]);

    return 0;
}
```

While some small details have been modified in the implementation, the code largely
follows the aglorithm described above. We have a total of `n + 1` queues, `n` for the
worker threads and `1` for the master. Since our queue takes in pointers, we're passing in
a `NULL` when we want to signal to the worker they can exit. Otherwise we enqueue in a
pointer to a variable that contains the current phase so workers know what they need to
do. We have also named the  queues `inbox` and `outbox`. The inbox is the incoming phase
each worker will dequeue from and the outbox is the queue a worker will enqueue to when it
is done.

One thing I want to point is an early mistake I made that left me quite confused until I
finally figure it out. Notice the `WorkerArgs` struct has two pointers to queues,
```
typedef struct {
    ...
    Queue *inbox;
    Queue *outbox;
} WorkerArgs;
```

I intially made the mistake of setting not making the inbox and outbox pointers. This
subtle differene would break everything in our setup. To understand why, we have to look
at how C works. The C programming language passes around things by value. Meaning, when we
declare our struct, the assignment operation on the `Queue inbox` and `Queue outbox`
fields on the struct will result in the original `Queue` struct being copied by value.
This may appear, at first glance to be okay, since the buffer is a pointer and copying a
pointer to a value would cause any issues. But the issue is with the other fields on the
`Queue` struct -- the `head`, `size`, etc. The end result will be each worker thread will
get a `WorkerArgs` struct that had different inbox and outbox queues to the one the master
thread has access to albeit the `Queue`'s buffer will be shared since it was a pointer. So
when master enqueues a value, the buffer will update but the `head` and `size` fields on
the `Queue` struct the worker has access to will not be changed since they are infact
different memory locations than the `Queue` struct the object enqueued onto!

The way to fix this is to declare the `inbox` and `outbox` as `Queue *inbox` and `Queue
*outbox`. Now, we get a pointer to the `Queue` instances instead of duplicate structs in
memory.

## Full Source
**main.c**
```
#include <math.h>
#include <stddef.h>
#include <stdio.h>

#include "bubble.h"

void transpose(int arr[], size_t size) {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            // Only process lower half of matrix
            if (j < i) continue;
            int t = arr[i * size + j];
            arr[i * size + j] = arr[j * size + i];
            arr[j * size + i] = t;
        }
    }
}

void print_matrix(int arr[], size_t size) {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            printf("%-5d ", arr[i * size + j]);
        }
        printf("\n");
    }
}

typedef struct {
    int id;
    int *arr;
    size_t size;
    Queue *inbox;
    Queue *outbox;
} WorkerArgs;

int main(void) {
    int N = 9;
    int n = 3;
    int arr[N] = {4, 3, 1, 9, 8, 7, 5, 6, 0};

    Queue tq[N];
    Queue mq;
    queue_init(&mq, N);

    WorkerArgs args[N];
    pthread_t tids[N];

    for (int i = 0; i < n; i++) {
        queue_init(&tq[i], 1);
        args[i].id = i;
        args[i].arr = arr;
        args[i].size = n;
        args[i].inbox = &tq[i];
        args[i].outbox = &mq;
        pthread_create(&tids[i], NULL, worker, &args[i]);
    }

    int P = ceil(log2(N) + 1);
    for (int phase = 1; phase <= P; phase++) {
        for (int i = 0; i < n; i++)
            queue_enqueue(&tq[i], &phase);

        int remaining = n;
        while (remaining > 0) {
            queue_dequeue(&mq);
            remaining--;
        }

        printf("\n");
        print_matrix(arr, n);
        printf(
           "after Phase %d (%s)\n",
           phase,
           phase % 2 == 0 ? "col sort" : "row sort"
       );

        transpose(arr, n);
    }

    for (int i = 0; i < n; i++) queue_enqueue(&tq[i], NULL);
    for(int i = 0; i < n; i++) pthread_join(tids[i], NULL);

    queue_destroy(&mq);
    for (int i = 0; i < n; i++)
        queue_destroy(&tq[i]);

    return 0;
}

void* worker(void *args) {
    WorkerArgs *worker_args = (WorkerArgs*) args;
    int row = worker_args->id;
    int size = worker_args->size;
    int *arr = worker_args->arr;

    int *phase = queue_dequeue(worker_args->inbox);
    while (phase != NULL) {
        if (*phase % 2 == 0) {
            sort(&arr[row * size], size, cmp_max);
        } else {
            sort(&arr[row * size], size, row % 2 == 0 ? cmp_max : cmp_min);
        }

        queue_enqueue(worker_args->outbox, phase);
        phase = queue_dequeue(worker_args->inbox);
    }

    return 0;
}
```

**queue.h**
```
#ifndef QUEUE_H
#define QUEUE_H

#include <stdio.h>
#include <stdlib.h>

typedef struct {
    void **buffer;
    int size;
    int capacity;
    int head;
    int tail;
    pthread_cond_t cond;
    pthread_mutex_t mutex;
} Queue;

void queue_init(Queue *queue, int capacity);
void queue_destroy(Queue *queue);
void* queue_dequeue(Queue *queue);
int queue_enqueue(Queue *queue, void *item);

#endif
```

**queue.c**
```
#include "queue.h"

void queue_init(Queue *queue, int capacity) {
    free(queue->buffer);
    pthread_cond_init(&queue->cond, NULL);
    pthread_mutex_init(&queue->mutex, NULL);
}

void queue_destroy(Queue *queue) {
    free(queue->buffer);
    pthread_cond_destroy(&queue->cond);
    pthread_mutex_destroy(&queue->mutex);
}

void* queue_dequeue(Queue *queue) {
    pthread_mutex_lock(&queue->mutex);
    if (queue->size == 0) {
        pthread_cond_wait(&queue->cond, &queue->mutex);
    }
    void *item = _unsafe_queue_dequeue(queue);
    pthread_mutex_unlock(&queue->mutex);
    return item;
}

int queue_enqueue(Queue *queue, void *item) {
    pthread_mutex_lock(&queue->mutex);
    int rc = _unsafe_queue_enqueue(queue, item);
    pthread_mutex_unlock(&queue->mutex);
    pthread_cond_signal(&queue->cond);
    return rc;
}

static void* _unsafe_queue_dequeue(Queue *queue) {
    if (queue->size == 0) return NULL;

    void *item = queue->buffer[queue->head];
    queue->buffer[queue->head] = NULL;
    queue->head = (queue->head + 1) % queue->capacity;
    queue->size--;
    return item;
}

static int _unsafe_queue_enqueue(Queue *queue, void *item) {
    if (queue->size == queue->capacity) return -1;

    queue->buffer[queue->tail] = item;
    queue->size++;
    queue->tail = (queue->tail + 1) % queue->capacity;
    return 0;
}
```

**bubble.h**
```
#include <stddef.h>

#ifndef BUBBLE_H
#define BUBBLE_H

int cmp_min(int, int);
int cmp_max(int, int);
void sort(int arr[], size_t size);

#endif
```

**bubble.c**
```
int cmp_min(int a, int b) {
  return a < b ? 1 : 0;
}

int cmp_max(int, int) {
  return a > b ? 1 : 0;
}

void sort(int arr[], size_t size, int (*cmp)(int, int)) {
    for (int i = size - 1; i > 0; i--) {
        int max_i = 0;
        for (int j = 0; j <= i; j++) {
            if (cmp(arr[j], arr[k])) max_i = j;
        }
        int t = arr[i];
        arr[i] = arr[max_i];
        arr[max_i] = t;
    }
}
```

[1]: https://stackoverflow.com/questions/1653958/why-are-ifndef-and-define-used-in-c-header-files
[2]: https://en.wikipedia.org/wiki/Inline_function
[3]: https://en.wikipedia.org/wiki/Locality_of_reference
[4]: https://computing.llnl.gov/tutorials/pthreads/#Mutexes
[5]: https://computing.llnl.gov/tutorials/pthreads/#ConditionVariables
[6]: https://en.wikipedia.org/wiki/Circular_buffer
[7]: https://stackoverflow.com/questions/558122/what-is-a-static-function
[8]: https://en.wikipedia.org/wiki/Lock_(computer_science)
[9]: https://en.wikipedia.org/wiki/Monitor_(synchronization)#Condition_variables

<!--

    dequeue
        Lock
        is size > 0
            yes ->
                dequeue as normal
                Unlock
            no ->
                condition_wait(Lock) // unlock Lock and wait for signal
                    Lock
                    dequeue as normal
                    Unlock

    enqueue
        Lock
        enqueue
        condition_signal
        Unlock

-->
