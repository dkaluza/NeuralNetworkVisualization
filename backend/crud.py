from app import create_app
from app.nnvis.models import Architecture, Model, Dataset, User
import argparse
from werkzeug.security import generate_password_hash


parser = argparse.ArgumentParser()
parser.add_argument('--method', type=str, required=True,
                    choices=['create', 'update', 'delete'])
parser.add_argument('--table', '-t', type=str, required=True,
                    choices=['Architecture', 'Model', 'Dataset', 'User'])
parser.add_argument('--id', type=int, default=None)
parser.add_argument('--name', '-n', type=str, default=None)
parser.add_argument('--desc', '-d', type=str, default=None)
parser.add_argument('--graph', '-g', type=str, default=None)
parser.add_argument('--arch_id', '-a', type=int, default=None)
parser.add_argument('--dataset_id', '-did', type=int, default=None)
parser.add_argument('--dataset', type=str, default=None)
parser.add_argument('--split', type=str, default=None)
parser.add_argument('--username', type=str, default=None)
parser.add_argument('--password', type=str, default=None)


app = create_app('config')

if __name__ == '__main__':
    args = parser.parse_args()

    ctx = app.app_context()
    ctx.push()

    if args.table == 'Architecture':
        if args.method == 'create':
            arch = Architecture(name=args.name,
                                description=args.desc,
                                graph=args.graph)
            arch.add()
        elif args.method == 'update':
            arch = Architecture.query.get(args.id)
            if args.name is not None:
                arch.name = args.name
            if args.desc is not None:
                arch.description = args.desc
            if args.graph is not None:
                arch.graph = args.graph
            arch.update()
        elif args.method == 'delete':
            arch = Architecture.query.get(args.id)
            arch.delete()
    elif args.table == 'Model':
        if args.method == 'create':
            model = Model(name=args.name,
                          description=args.desc,
                          arch_id=args.arch_id,
                          dataset_id=args.dataset_id,
                          weights_path='')
            model.add()
        elif args.method == 'update':
            model = Model.query.get(args.id)
            if args.name is not None:
                model.name = args.name
            if args.desc is not None:
                model.description = args.desc
            model.update()
        elif args.method == 'delete':
            model = Model.query.get(args.id)
            model.delete()
    elif args.table == 'Dataset':
        if args.method == 'create':
            dataset = Dataset(name=args.name,
                              description=args.desc,
                              trainset_path=args.dataset,
                              split_path=args.split)
            dataset.add()
        elif args.method == 'update':
            dataset = Dataset.query.get(args.id)
            if args.name is not None:
                dataset.name = args.name
            if args.desc is not None:
                dataset.description = args.desc
            dataset.update()
        elif args.method == 'delete':
            dataset = Dataset.query.get(args.id)
            dataset.delete()
    elif args.table == 'User':
        if args.method == 'create':
            user = User(username=args.username,
                        password=args.password)
            user.add()
            print(User.query.all())
        elif args.method == 'update':
            user = User.query.get(args.id)
            if args.username is not None:
                user.username = args.username
            if args.password is not None:
                user.password = generate_password_hash(args.password)
            user.update()
        elif args.method == 'delete':
            user = User.query.get(args.id)
            user.delete()
    ctx.pop()
