#Program by Simon Hanly-Jones z5149715 for text classification assignment COMP9417, machine learning pipeline structure was applied from Introduction to Machine Learning with Python: A guide for Data Scientists by Muller and Guido.
#this file contains a cross validation pipeline for Logistic Regression, Multinational Naive Bayes, and K Nearest Neighbours using both Bag of Word features and TF-IDF features
#this file also contains the final model chosen for classification.
#Each model can be run from the main function, by uncommenting the relevant line. It is set to run the final model by default

import matplotlib.pyplot as plt
import seaborn as sn
import pandas as pd
import numpy as np

from sklearn import preprocessing
from sklearn.naive_bayes import MultinomialNB, BernoulliNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn import metrics
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import KNeighborsClassifier

from sklearn.svm import SVC
import csv

def main():
    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #tfid_vectoriser_MN_bayes(df_train, df_test)
    
    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #tfid_vectoriser_logisitic_regression(df_train, df_test)    
    
    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #tfid_vectoriser_KNeighborsClassifier(df_train, df_test)

    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #tfid_vectoriser_RandomForestClassifier(df_train, df_test)

    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #bow_vectoriser_MN_bayes(df_train, df_test)

    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #bow_vectoriser_KNeighborsClassifier(df_train, df_test)

    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')
    #bow_vectoriser_logisitic_regression(df_train, df_test)

    df_train = pd.read_csv('training.csv')
    df_train.set_index('article_number')

    df_test = pd.read_csv('test.csv')
    df_test.set_index('article_number')

    run_final_model(df_train, df_test)


def tfid_vectoriser_SVM(df_train, df_test):

    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(TfidfVectorizer(min_df=5),
    SVC())
    param_grid = {
            'svc__C': [0.001, 0.01, 0.1, 1, 10],
            'svc__kernel': ['poly', 'linear', 'rbf','sigmoid'],
            'svc__gamma' : ['scale', 0.001, 0.01, 0.1, 1, 10],
            }
    grid = GridSearchCV(pipe, param_grid, cv=4, scoring='f1_weighted', n_jobs=4, verbose= True)

    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))
    

    y_pred = grid.predict(text_test)

    #save best params and results
    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('SVC_tfid_class_rep.txt','w') as file:
        file.write("cv results: \n")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: \n")
        file.write(str(grid.best_estimator_))

        file.write("\n\n\n")
        file.write(class_rep)   

    #save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("SVC_tfid_confusion_martix.png")


def tfid_vectoriser_logisitic_regression(df_train, df_test):
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(TfidfVectorizer(min_df=5),
    LogisticRegression(max_iter = 10000))
    param_grid = {
            'logisticregression__C': [0.001, 0.01, 0.1, 1, 10, 50, 100], 
            'logisticregression__solver': ['newton-cg', 'sag', 'saga', 'lbfgs']
            }
    grid = GridSearchCV(pipe, param_grid, scoring='f1_weighted', cv=5, n_jobs=4, verbose= True)
    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))

    y_pred = grid.predict(text_test)

    #Save best params and results
    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('tfid_log_reg_class_rep.txt','w') as file:
        file.write("cv results: \n")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: \n")
        file.write(str(grid.best_estimator_))

        file.write("\n\n\n")
        file.write(class_rep)   

    #save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("tfid_log_reg_confusion_martix.png")

def bow_vectoriser_logisitic_regression(df_train, df_test):
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(CountVectorizer(),
    LogisticRegression(max_iter = 10000))
    param_grid = {
            'logisticregression__C': [0.001, 0.01, 0.1, 1, 10, 50, 100], 
            'logisticregression__solver': ['newton-cg', 'sag', 'saga', 'lbfgs']
            }
    grid = GridSearchCV(pipe, param_grid, scoring='f1_weighted', cv=5, n_jobs=4, verbose= True)
    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))
    
    y_pred = grid.predict(text_test)

    #Save best params and results
    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('bow_log_reg_class_rep.txt','w') as file:
        file.write("cv results: \n")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: \n")
        file.write(str(grid.best_estimator_))

        file.write("\n\n\n")
        file.write(class_rep)   

    #save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("bow_log_reg_confusion_martix.png")

def tfid_vectoriser_MN_bayes(df_train, df_test):
    
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(TfidfVectorizer(min_df=5),
    MultinomialNB())
    param_grid = {
            'multinomialnb__alpha': [0.001, 0.01, 0.1, .3, .5,.7, 1], 
            'multinomialnb__fit_prior': ['True', 'False']
            }
    grid = GridSearchCV(pipe, param_grid, scoring='f1_weighted', cv=5, n_jobs=4, verbose= True)

    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))


    y_pred = grid.predict(text_test)

    #Save best params and results

    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('tfid_mn_bayes_class_rep.txt','w') as file:
        file.write("cv results: \n")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: \n")
        file.write(str(grid.best_estimator_))
        file.write("\n\n\n")
        file.write(class_rep)   

    #Save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("tfid_mn_bayes_confusion_martix.png")

def bow_vectoriser_MN_bayes(df_train, df_test):
    
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(CountVectorizer(),
    MultinomialNB())
    param_grid = {
            'multinomialnb__alpha': [0.001, 0.01, 0.1, .3, .5,.7, 1], 
            'multinomialnb__fit_prior': ['True', 'False']
            }
    grid = GridSearchCV(pipe, param_grid, scoring='f1_weighted', cv=5, n_jobs=4, verbose= True)

    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))
    
    
    y_pred = grid.predict(text_test)
    #Save best params and results

    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('bow_mn_bayes_class_rep.txt','w') as file:
        file.write("cv results: \n")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: \n")
        file.write(str(grid.best_estimator_))
        file.write("\n\n\n")
        file.write(class_rep)   

    #Save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("bow_mn_bayes_confusion_martix.png")



def tfid_vectoriser_KNeighborsClassifier(df_train, df_test):
    
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(TfidfVectorizer(min_df=5),
    KNeighborsClassifier())
    param_grid = {
            'kneighborsclassifier__n_neighbors': [11,12,13,14,15,16,17], 
            'kneighborsclassifier__weights': ['uniform', 'distance']
            }
    grid = GridSearchCV(pipe, param_grid, scoring='f1_weighted', cv=5, n_jobs=4, verbose= True)

    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))
    

    y_pred = grid.predict(text_test)

    #Save best params and results

    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('tfid_KNN_class_rep.txt','w') as file:
        file.write("cv results: ")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: ")
        file.write(str(grid.best_estimator_))
        file.write(class_rep)   

    #Save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("tfid_KNN_confusion_martix.png")

def bow_vectoriser_KNeighborsClassifier(df_train, df_test):
    
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)

    pipe = make_pipeline(CountVectorizer(),
    KNeighborsClassifier())
    param_grid = {
            'kneighborsclassifier__n_neighbors': [13,14,15,16,17], 
            'kneighborsclassifier__weights': ['uniform', 'distance']
            }
    grid = GridSearchCV(pipe, param_grid, scoring='f1_weighted', cv=5, n_jobs=4, verbose= True)

    grid.fit(text_train, y_train)
    best_score = ("Best cross-validation score: {:.2f}".format(grid.best_score_))

    y_pred = grid.predict(text_test)

    #Save best params and results
    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('bow_KNN_class_rep.txt','w') as file:
        file.write("cv results: ")
        file.write(str(grid.cv_results_))

        file.write("\n\n\n")
        file.write(str(best_score))

        file.write("\n\n\nbest params: ")
        file.write(str(grid.best_estimator_))
        file.write(class_rep)   

    #Save confusion matrix
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("bow_KNN_confusion_martix.png")


def run_final_model(df_train, df_test):
    
    y_train_text = df_train.pop("topic")
    text_train = df_train['article_words'].str.replace(",", " ")
    text_train = text_train.str.replace("_", " ")

    y_test_text = df_test.pop("topic")
    text_test = df_test['article_words'].str.replace(",", " ")
    text_test = text_test.str.replace("_", " ")

    #encode y_labels
    le = preprocessing.LabelEncoder()
    le.fit(y_train_text)
    y_train = le.transform(y_train_text)
    y_test = le.transform(y_test_text)
    vect = TfidfVectorizer(min_df=5)
    X_train = vect.fit_transform(text_train)
    X_test = vect.transform(text_test)

    mod = LogisticRegression(max_iter = 10000, C = 10, solver = 'saga')
    
    mod.fit(X_train, y_train)

    y_pred = mod.predict(X_test)
    y_pred_probs = mod.predict_proba(X_test)

    row_list = []    
    #create and save output for report
    for category in range(len(le.classes_)):

        index_of_all_docs= np.argwhere(y_pred == category)
        
        for doc_index in index_of_all_docs:
            row_dict = {}
            row_dict['topic'] = le.classes_[category]
            row_dict['doc_index'] = int(doc_index)
            row_dict['probability'] = float(y_pred_probs[doc_index, category])
            row_dict['article_number'] = df_test.loc[doc_index,'article_number'].values[0]
            
            if y_test[doc_index] == category:
                row_dict['correct'] = True
            elif not y_test[doc_index] == category:
                row_dict['correct'] = False
            row_list.append(row_dict)

    probs_df = pd.DataFrame(row_list)

    probs_df.sort_values(by=['topic', 'probability'], axis=0, ascending=[True,False], inplace=True)

    probs_df.to_csv("probs_df.csv")

    assert(len(y_test) == probs_df.shape[0])
    probs_df_top10 = probs_df.groupby('topic')
    probs_df_top10 = probs_df_top10.head(10)
    probs_df_top10.to_csv("probs_df_top10.csv")

    #save classification report for testing data
    class_rep  = metrics.classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred))
 
    with open('final_model_classification_report.txt','w') as file:

        file.write(class_rep)


    #save confusion matrix for training data
    y_pred_train = mod.predict(X_train)

    data = metrics.confusion_matrix(le.inverse_transform(y_train), le.inverse_transform(y_pred_train), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_train)), index = np.unique(le.inverse_transform(y_train)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("final_model_training_confusion_martix.png")

    #save confusion matrix for testing data
    data = metrics.confusion_matrix(le.inverse_transform(y_test), le.inverse_transform(y_pred), labels = le.classes_)
    df_cm = pd.DataFrame(data, columns=np.unique(le.inverse_transform(y_test)), index = np.unique(le.inverse_transform(y_test)))
    df_cm.index.name = 'Actual'
    df_cm.columns.name = 'Predicted'
    plt.figure(figsize = (10,7))
    
    sn.heatmap(df_cm, cmap="Blues", annot=True, fmt='g')
    plt.tight_layout() 

    plt.savefig("final_model_testing_confusion_martix.png")

    


if __name__ == "__main__":
    main()
    






